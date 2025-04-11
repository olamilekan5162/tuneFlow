import React, { useState } from "react";
import styles from "./MusicNftUpload.module.css";
import { useNetworkVariables } from "../../config/networkConfig";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const MusicNFTUpload = ({ onSubmit, walletConnected }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);

  const { tunflowNFTRegistryId, tunflowPackageId } = useNetworkVariables(
    "tunflowNFTRegistryId",
    "tunflowPackageId"
  );

  const suiClient = useSuiClient();
  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    audioFile: null,
    coverImage: null,
    genre: "",
    releaseDate: "",
    contributors: [{ address: "", name: "", role: "Artist", share: 100 }],
    royaltyPercentage: 10,
    edition: "single", // single, limited, open
    editionCount: 1,
    price: 0.1,
    blockchain: "ethereum",
  });

  const uploadMusic = (e) => {
    e.preventDefault();
    const tx = new Transaction();

    tx.moveCall({
      arguments: [
        tx.object(tunflowNFTRegistryId),
        tx.pure.string("Sui Jam"),
        tx.pure.string("Another hit gem from oracleLoaded"),
        tx.pure.string("https://usercontent.jamendo.com?type=album&id=252044&width=300&trackid=1709361"),
        tx.pure.string("https://prod-1.storage.jamendo.com/?trackid=1880336&format=mp31&from=5WWAextcrCNQ0AoHkuxPMw%3D%3D%7CRMvbyM%2FsigD7IrNaX3LLOA%3D%3D"),
        tx.pure.string("https://prod-1.storage.jamendo.com/?trackid=1880336&format=mp31&from=5WWAextcrCNQ0AoHkuxPMw%3D%3D%7CRMvbyM%2FsigD7IrNaX3LLOA%3D%3D"),
        tx.pure.u64(1),
        tx.pure.u64(5),
        tx.pure.vector("address", [
          "0xa35e89e56f9064f5c64edbcdd54cec51f7622720c942c2810809792af97c1359",
        ]),
        tx.pure.vector("u64", [10000]),
      ],
      target: `${tunflowPackageId}::music_nft::mint_music_nft`,
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async ({ digest }) => {
          const { effects } = await suiClient.waitForTransaction({
            digest: digest,
            options: {
              showEffects: true,
            },
          });

          console.log(effects?.created?.[0]?.reference?.objectId);
          console.log("Uploaded!!!");
        },
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({
      ...formData,
      [name]: files[0],
    });
  };

  const handleContributorChange = (index, field, value) => {
    const updatedContributors = [...formData.contributors];
    updatedContributors[index] = {
      ...updatedContributors[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      contributors: updatedContributors,
    });
  };

  const addContributor = () => {
    // Calculate remaining share
    const usedShare = formData.contributors.reduce(
      (sum, contributor) => sum + Number(contributor.share),
      0
    );
    const remainingShare = Math.max(0, 100 - usedShare);

    setFormData({
      ...formData,
      contributors: [
        ...formData.contributors,
        { address: "", name: "", role: "Contributor", share: remainingShare },
      ],
    });
  };

  const removeContributor = (index) => {
    if (formData.contributors.length > 1) {
      const updatedContributors = formData.contributors.filter(
        (_, i) => i !== index
      );

      // Redistribute the removed contributor's share to the first contributor
      if (index !== 0 && updatedContributors.length > 0) {
        const removedShare = formData.contributors[index].share;
        updatedContributors[0].share =
          Number(updatedContributors[0].share) + Number(removedShare);
      }

      setFormData({
        ...formData,
        contributors: updatedContributors,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // Here you would integrate with your Web3 minting logic
      await onSubmit(formData);

      // Reset form after successful submission
      setFormData({
        title: "",
        description: "",
        audioFile: null,
        coverImage: null,
        genre: "",
        releaseDate: "",
        contributors: [{ address: "", name: "", role: "Artist", share: 100 }],
        royaltyPercentage: 10,
        edition: "single",
        editionCount: 1,
        price: 0.1,
        blockchain: "ethereum",
      });
      setActiveStep(0);
    } catch (error) {
      console.error("Error minting NFT:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const togglePreview = () => {
    setPreviewActive(!previewActive);
  };

  const nextStep = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const prevStep = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Step validation
  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return formData.title && formData.audioFile;
      case 1:
        return formData.contributors.every((c) => c.name && c.share > 0);
      case 2:
        return true;
      default:
        return false;
    }
  };

  // Step components
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>Music Details</h3>

            <div className={styles.uploadArea}>
              <label className={styles.fileUpload}>
                {formData.audioFile ? (
                  <div className={styles.filePreview}>
                    <div className={styles.fileName}>
                      {formData.audioFile.name}
                    </div>
                    <audio controls className={styles.audioPreview}>
                      <source src={URL.createObjectURL(formData.audioFile)} />
                    </audio>
                  </div>
                ) : (
                  <div className={styles.uploadPrompt}>
                    <div className={styles.uploadIcon}>
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 16L12 8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 11L12 8L15 11"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className={styles.uploadText}>
                      <span className={styles.primary}>
                        Drag & drop or click to upload
                      </span>
                      <span className={styles.secondary}>
                        Supported formats: MP3, WAV (Max 100MB)
                      </span>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  name="audioFile"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className={styles.hiddenInput}
                />
              </label>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.label}>
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter track title"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Tell the story behind your music"
                rows="3"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="genre" className={styles.label}>
                  Genre
                </label>
                <select
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="">Select Genre</option>
                  <option value="electronic">Electronic</option>
                  <option value="hiphop">Hip Hop</option>
                  <option value="pop">Pop</option>
                  <option value="rock">Rock</option>
                  <option value="jazz">Jazz</option>
                  <option value="ambient">Ambient</option>
                  <option value="classical">Classical</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="releaseDate" className={styles.label}>
                  Release Date
                </label>
                <input
                  type="date"
                  id="releaseDate"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Cover Image</label>
              <label className={styles.imageUpload}>
                {formData.coverImage ? (
                  <div className={styles.imagePreview}>
                    <img
                      src={URL.createObjectURL(formData.coverImage)}
                      alt="Cover preview"
                      className={styles.previewImg}
                    />
                    <div className={styles.imageOverlay}>Click to change</div>
                  </div>
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                      <path
                        d="M21 15L16 10L9 17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Upload Cover Art</span>
                  </div>
                )}
                <input
                  type="file"
                  name="coverImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.hiddenInput}
                />
              </label>
              <span className={styles.hint}>
                Recommended: 1400×1400px JPG, PNG
              </span>
            </div>
          </div>
        );

      case 1:
        return (
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>Contributors & Royalties</h3>
            <p className={styles.stepDescription}>
              Add all contributors who should receive credit and royalties
            </p>

            <div className={styles.contributorsWrapper}>
              {formData.contributors.map((contributor, index) => (
                <div key={index} className={styles.contributorCard}>
                  <div className={styles.contributorHeader}>
                    <h4 className={styles.contributorTitle}>
                      {index === 0 ? "Primary Artist" : `Contributor ${index}`}
                    </h4>
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => removeContributor(index)}
                        className={styles.removeBtn}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className={styles.contributorForm}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Name *</label>
                      <input
                        type="text"
                        value={contributor.name}
                        onChange={(e) =>
                          handleContributorChange(index, "name", e.target.value)
                        }
                        className={styles.input}
                        placeholder="Artist name"
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Wallet Address</label>
                      <input
                        type="text"
                        value={contributor.address}
                        onChange={(e) =>
                          handleContributorChange(
                            index,
                            "address",
                            e.target.value
                          )
                        }
                        className={styles.input}
                        placeholder="0x..."
                      />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Role</label>
                        <select
                          value={contributor.role}
                          onChange={(e) =>
                            handleContributorChange(
                              index,
                              "role",
                              e.target.value
                            )
                          }
                          className={styles.select}
                        >
                          <option value="Artist">Artist</option>
                          <option value="Producer">Producer</option>
                          <option value="Songwriter">Songwriter</option>
                          <option value="Composer">Composer</option>
                          <option value="Performer">Performer</option>
                          <option value="Engineer">Engineer</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>Share % *</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={contributor.share}
                          onChange={(e) =>
                            handleContributorChange(
                              index,
                              "share",
                              Math.min(100, Number(e.target.value))
                            )
                          }
                          className={styles.input}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addContributor}
                className={styles.addContributorBtn}
              >
                + Add Contributor
              </button>

              {/* Total shares indicator */}
              <div className={styles.sharesIndicator}>
                <div className={styles.sharesLabel}>
                  Total Shares:{" "}
                  <span
                    className={
                      formData.contributors.reduce(
                        (sum, c) => sum + Number(c.share),
                        0
                      ) === 100
                        ? styles.sharesValid
                        : styles.sharesInvalid
                    }
                  >
                    {formData.contributors.reduce(
                      (sum, c) => sum + Number(c.share),
                      0
                    )}
                    %
                  </span>
                </div>
                <div className={styles.sharesProgress}>
                  <div
                    className={styles.sharesBar}
                    style={{
                      width: `${Math.min(
                        100,
                        formData.contributors.reduce(
                          (sum, c) => sum + Number(c.share),
                          0
                        )
                      )}%`,
                      backgroundColor:
                        formData.contributors.reduce(
                          (sum, c) => sum + Number(c.share),
                          0
                        ) === 100
                          ? "#4CAF50"
                          : "#FF9800",
                    }}
                  ></div>
                </div>
                <div className={styles.sharesHint}>
                  {formData.contributors.reduce(
                    (sum, c) => sum + Number(c.share),
                    0
                  ) === 100
                    ? "Perfect! Shares total 100%"
                    : "Total shares should equal 100%"}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="royaltyPercentage" className={styles.label}>
                  Secondary Market Royalty %
                </label>
                <input
                  type="number"
                  id="royaltyPercentage"
                  name="royaltyPercentage"
                  min="0"
                  max="50"
                  value={formData.royaltyPercentage}
                  onChange={handleChange}
                  className={styles.input}
                />
                <span className={styles.hint}>
                  Percentage of sales on secondary marketplaces that goes back
                  to the creator(s)
                </span>
              </div>
            </div>
          </div>
        );

      // case 2:
      //   return (
      //     <div className={styles.step}>
      //       <h3 className={styles.stepTitle}>NFT Settings</h3>

      //       <div className={styles.formGroup}>
      //         <label className={styles.label}>Edition Type</label>
      //         <div className={styles.editionOptions}>
      //           <label
      //             className={`${styles.editionOption} ${
      //               formData.edition === "single" ? styles.selected : ""
      //             }`}
      //           >
      //             <input
      //               type="radio"
      //               name="edition"
      //               value="single"
      //               checked={formData.edition === "single"}
      //               onChange={handleChange}
      //               className={styles.hiddenInput}
      //             />
      //             <div className={styles.editionIcon}>1/1</div>
      //             <div className={styles.editionLabel}>
      //               <span className={styles.editionName}>Single Edition</span>
      //               <span className={styles.editionDesc}>
      //                 One unique collectible
      //               </span>
      //             </div>
      //           </label>

      //           <label
      //             className={`${styles.editionOption} ${
      //               formData.edition === "limited" ? styles.selected : ""
      //             }`}
      //           >
      //             <input
      //               type="radio"
      //               name="edition"
      //               value="limited"
      //               checked={formData.edition === "limited"}
      //               onChange={handleChange}
      //               className={styles.hiddenInput}
      //             />
      //             <div className={styles.editionIcon}>
      //               <svg
      //                 width="24"
      //                 height="24"
      //                 viewBox="0 0 24 24"
      //                 fill="none"
      //                 xmlns="http://www.w3.org/2000/svg"
      //               >
      //                 <rect
      //                   x="3"
      //                   y="3"
      //                   width="7"
      //                   height="7"
      //                   rx="1"
      //                   stroke="currentColor"
      //                   strokeWidth="2"
      //                 />
      //                 <rect
      //                   x="14"
      //                   y="3"
      //                   width="7"
      //                   height="7"
      //                   rx="1"
      //                   stroke="currentColor"
      //                   strokeWidth="2"
      //                 />
      //                 <rect
      //                   x="3"
      //                   y="14"
      //                   width="7"
      //                   height="7"
      //                   rx="1"
      //                   stroke="currentColor"
      //                   strokeWidth="2"
      //                 />
      //                 <rect
      //                   x="14"
      //                   y="14"
      //                   width="7"
      //                   height="7"
      //                   rx="1"
      //                   stroke="currentColor"
      //                   strokeWidth="2"
      //                 />
      //               </svg>
      //             </div>
      //             <div className={styles.editionLabel}>
      //               <span className={styles.editionName}>Limited Edition</span>
      //               <span className={styles.editionDesc}>
      //                 Fixed number of identical NFTs
      //               </span>
      //             </div>
      //           </label>

      //           <label
      //             className={`${styles.editionOption} ${
      //               formData.edition === "open" ? styles.selected : ""
      //             }`}
      //           >
      //             <input
      //               type="radio"
      //               name="edition"
      //               value="open"
      //               checked={formData.edition === "open"}
      //               onChange={handleChange}
      //               className={styles.hiddenInput}
      //             />
      //             <div className={styles.editionIcon}>∞</div>
      //             <div className={styles.editionLabel}>
      //               <span className={styles.editionName}>Open Edition</span>
      //               <span className={styles.editionDesc}>
      //                 Unlimited for a time period
      //               </span>
      //             </div>
      //           </label>
      //         </div>
      //       </div>

      //       {formData.edition === "limited" && (
      //         <div className={styles.formGroup}>
      //           <label htmlFor="editionCount" className={styles.label}>
      //             Number of Editions
      //           </label>
      //           <input
      //             type="number"
      //             id="editionCount"
      //             name="editionCount"
      //             min="2"
      //             max="10000"
      //             value={formData.editionCount}
      //             onChange={handleChange}
      //             className={styles.input}
      //           />
      //         </div>
      //       )}

      //       <div className={styles.formRow}>
      //         <div className={styles.formGroup}>
      //           <label htmlFor="price" className={styles.label}>
      //             Price
      //           </label>
      //           <div className={styles.priceInput}>
      //             <input
      //               type="number"
      //               id="price"
      //               name="price"
      //               min="0"
      //               step="0.01"
      //               value={formData.price}
      //               onChange={handleChange}
      //               className={styles.input}
      //             />
      //             <select
      //               name="blockchain"
      //               value={formData.blockchain}
      //               onChange={handleChange}
      //               className={styles.currencySelect}
      //             >
      //               <option value="sui">SUI</option>
      //               <option value="polygon">MATIC</option>
      //               <option value="solana">SOL</option>
      //               <option value="arbitrum">ARB</option>
      //               <option value="optimism">OP</option>
      //             </select>
      //           </div>
      //         </div>

      //         <div className={styles.formGroup}>
      //           <label htmlFor="blockchain" className={styles.label}>
      //             Blockchain
      //           </label>
      //           <select
      //             id="blockchain"
      //             name="blockchain"
      //             value={formData.blockchain}
      //             onChange={handleChange}
      //             className={styles.select}
      //           >
      //             <option value="ethereum">Ethereum</option>
      //             <option value="polygon">Polygon</option>
      //             <option value="solana">Solana</option>
      //             <option value="arbitrum">Arbitrum</option>
      //             <option value="optimism">Optimism</option>
      //           </select>
      //         </div>
      //       </div>

      //       {/* NFT Preview Card */}
      //       <div className={styles.previewSection}>
      //         <h4 className={styles.previewTitle}>Preview NFT</h4>

      //         <div className={styles.nftCard}>
      //           <div className={styles.nftImage}>
      //             {formData.coverImage ? (
      //               <img
      //                 src={URL.createObjectURL(formData.coverImage)}
      //                 alt="NFT Preview"
      //                 className={styles.nftCover}
      //               />
      //             ) : (
      //               <div className={styles.nftImagePlaceholder}>
      //                 <svg
      //                   width="48"
      //                   height="48"
      //                   viewBox="0 0 24 24"
      //                   fill="none"
      //                   xmlns="http://www.w3.org/2000/svg"
      //                 >
      //                   <path
      //                     d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
      //                     stroke="currentColor"
      //                     strokeWidth="1.5"
      //                     strokeLinecap="round"
      //                     strokeLinejoin="round"
      //                   />
      //                   <path
      //                     d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
      //                     stroke="currentColor"
      //                     strokeWidth="1.5"
      //                     strokeLinecap="round"
      //                     strokeLinejoin="round"
      //                   />
      //                   <path
      //                     d="M2.67 18.95L7 15.9C7.6 15.5 8.48 15.56 9 16.06L9.35 16.44C9.91 17.05 10.85 17.05 11.41 16.44L15.1 12.44C15.66 11.84 16.6 11.84 17.16 12.44L22 17.5"
      //                     stroke="currentColor"
      //                     strokeWidth="1.5"
      //                     strokeLinecap="round"
      //                     strokeLinejoin="round"
      //                   />
      //                 </svg>
      //               </div>
      //             )}

      //             {formData.audioFile && (
      //               <div className={styles.audioControls}>
      //                 <button
      //                   type="button"
      //                   onClick={togglePreview}
      //                   className={styles.playButton}
      //                 >
      //                   {previewActive ? (
      //                     <svg
      //                       width="24"
      //                       height="24"
      //                       viewBox="0 0 24 24"
      //                       fill="none"
      //                       xmlns="http://www.w3.org/2000/svg"
      //                     >
      //                       <path
      //                         d="M8 5V19M16 5V19"
      //                         stroke="currentColor"
      //                         strokeWidth="2"
      //                         strokeLinecap="round"
      //                         strokeLinejoin="round"
      //                       />
      //                     </svg>
      //                   ) : (
      //                     <svg
      //                       width="24"
      //                       height="24"
      //                       viewBox="0 0 24 24"
      //                       fill="none"
      //                       xmlns="http://www.w3.org/2000/svg"
      //                     >
      //                       <path
      //                         d="M5 4.99999L19 12L5 19V4.99999Z"
      //                         fill="currentColor"
      //                         stroke="currentColor"
      //                         strokeWidth="2"
      //                         strokeLinecap="round"
      //                         strokeLinejoin="round"
      //                       />
      //                     </svg>
      //                   )}
      //                 </button>
      //               </div>
      //             )}
      //           </div>

      //           <div className={styles.nftInfo}>
      //             <div className={styles.nftTitle}>
      //               {formData.title || "Untitled Track"}
      //             </div>
      //             <div className={styles.nftArtist}>
      //               {formData.contributors[0]?.name || "Artist Name"}
      //             </div>

      //             <div className={styles.nftDetails}>
      //               <div className={styles.nftEdition}>
      //                 {formData.edition === "single" && "1 of 1"}
      //                 {formData.edition === "limited" &&
      //                   `1 of ${formData.editionCount}`}
      //                 {formData.edition === "open" && "Open Edition"}
      //               </div>
      //               <div className={styles.nftPrice}>
      //                 {formData.price}{" "}
      //                 {formData.blockchain === "ethereum"
      //                   ? "ETH"
      //                   : formData.blockchain === "polygon"
      //                   ? "MATIC"
      //                   : formData.blockchain === "solana"
      //                   ? "SOL"
      //                   : formData.blockchain === "arbitrum"
      //                   ? "ARB"
      //                   : "OP"}
      //               </div>
      //             </div>
      //           </div>
      //         </div>
      //       </div>
      //     </div>
      //   );

      default:
        return null;
    }
  };

  return (
    <div className={styles.musicNFTUpload}>
      <button onClick={uploadMusic}>Upload</button>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create Music NFT</h2>
          <div className={styles.subtitle}>
            Upload your music as an NFT to the blockchain
          </div>
        </div>

        {!walletConnected && (
          <div className={styles.walletWarning}>
            <div className={styles.warningIcon}>⚠️</div>
            <div className={styles.warningText}>
              <p className={styles.warningTitle}>Wallet not connected</p>
              <p className={styles.warningMessage}>
                Please connect your wallet to mint NFTs
              </p>
            </div>
            <button className={styles.connectButton}>Connect Wallet</button>
          </div>
        )}

        <div className={styles.stepIndicator}>
          <div className={styles.steps}>
            <div
              className={`${styles.step} ${
                activeStep >= 0 ? styles.active : ""
              } ${activeStep > 0 ? styles.completed : ""}`}
            >
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepLabel}>Music Details</div>
            </div>
            <div className={styles.stepConnector}></div>
            <div
              className={`${styles.step} ${
                activeStep >= 1 ? styles.active : ""
              } ${activeStep > 1 ? styles.completed : ""}`}
            >
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepLabel}>Contributors</div>
            </div>
            <div className={styles.stepConnector}></div>
            <div
              className={`${styles.step} ${
                activeStep >= 2 ? styles.active : ""
              } ${activeStep > 2 ? styles.completed : ""}`}
            >
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepLabel}>NFT Settings</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {renderStepContent()}

          <div className={styles.formActions}>
            {activeStep > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className={styles.backButton}
                disabled={isUploading}
              >
                Back
              </button>
            )}
            <button onClick={uploadMusic}>Upload</button>
            {activeStep < 2 ? (
              <button
                type="button"
                onClick={nextStep}
                className={styles.primaryButton}
                disabled={!isStepValid() || isUploading}
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                className={styles.mintButton}
                onClick={uploadMusic}
                disabled={!isStepValid() || isUploading || !walletConnected}
              >
                {isUploading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Minting...
                  </>
                ) : (
                  "Mint NFT"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MusicNFTUpload;
