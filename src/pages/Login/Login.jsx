import React, { useState, useEffect } from "react";
import styles from "./Login.module.css";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ConnectButton } from "@mysten/dapp-kit";
import { useCurrentWallet } from "@mysten/dapp-kit";

const Login = () => {
  const [isZkLoading, setIsZkLoading] = useState(false);
  const [showZkForm, setShowZkForm] = useState(false);
  const { isConnected } = useCurrentWallet();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(()=> {
    if (isConnected) {
      navigate("/homepage");
      }
  }, [isConnected, navigate]);


  const handleZkLogin = () => {
    setIsZkLoading(true);
    // Simulate login process
    setTimeout(() => {
      setIsZkLoading(false);
      setShowZkForm(true); // Show the form after loading
    }, 2000);
  };

  const handleFormClose = () => {
    setShowZkForm(false);
    // Reset form fields when closing
    setEmail("");
    setPassword("");
    setRememberMe(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsFormSubmitting(true);

    // Simulate authentication process
    setTimeout(() => {
      setIsFormSubmitting(false);
      console.log("Login with:", { email, password, rememberMe });
      // Here you would handle redirection to homepage
      setShowZkForm(false);
    }, 1500);
  };

  useEffect(() => {
    // Create background node animations
    const createNodes = () => {
      const container = document.querySelector(`.${styles.loginContainer}`);
      if (!container) return;

      // Clear existing nodes first
      const existingNodes = document.querySelectorAll(`.${styles.node}`);
      existingNodes.forEach((node) => node.remove());

      // Create new nodes
      for (let i = 0; i < 12; i++) {
        const node = document.createElement("div");
        node.className = styles.node;

        // Random positioning
        node.style.left = `${Math.random() * 100}%`;
        node.style.top = `${Math.random() * 100}%`;
        node.style.animationDuration = `${Math.random() * 15 + 20}s`;
        node.style.animationDelay = `${Math.random() * 5}s`;

        container.appendChild(node);
      }
    };

    createNodes();

    // Recreate nodes occasionally for fresh animations
    const interval = setInterval(createNodes, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.loginContainer}>
      <div className={styles.glowCircle}></div>

      <div className={styles.card}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <span>ST</span>
          </div>
          <div className={styles.logoRing}></div>
          <div className={styles.logoRing2}></div>
        </div>

        <h1 className={styles.title}>
          Welcome to <span className={styles.gradient}>SuiTunes</span>
        </h1>
        <p className={styles.subtitle}>Experience Music like never before</p>

        <div className={styles.buttons}>
          <button
            className={`${styles.zkLogin} ${isZkLoading ? styles.loading : ""}`}
            onClick={handleZkLogin}
            disabled={isZkLoading}
          >
            {isZkLoading ? (
              <span className={styles.loader}></span>
            ) : (
              <>
                <span className={styles.buttonIcon}>🔐</span>
                Sign in with zkLogin
              </>
            )}
          </button>

          <div className={styles.separator}>
            <span>or</span>
          </div>

          <div className={styles.walletConnectWrapper}>
            <ConnectButton />
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🎵</span>
            <span>Own Your Music</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>💰</span>
            <span>Support Artists</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🔄</span>
            <span>Trade NFTs</span>
          </div>
        </div>
      </div>

      {/* Sign In Form Modal */}
      {showZkForm && (
        <div className={styles.formOverlay}>
          <div className={styles.formContainer}>
            <button className={styles.closeButton} onClick={handleFormClose}>
              ×
            </button>

            <div className={styles.formHeader}>
              <div className={styles.logoMini}>
                <span>ST</span>
              </div>
              <h2>
                Sign in to <span className={styles.gradientText}>SuiTunes</span>
              </h2>
            </div>

            <p className={styles.zkMessage}>
              <span className={styles.zkIcon}>🔐</span>
              Secure authentication with zero-knowledge proof
            </p>

            <form onSubmit={handleFormSubmit}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <div className={styles.formOptions}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <span className={styles.checkmark}></span>
                  Remember me
                </label>
                <a href="#" className={styles.forgotLink}>
                  Forgot password?
                </a>
              </div>

              <Link to="/homepage">
                <button
                  type="submit"
                  className={`${styles.submitButton} ${
                    isFormSubmitting ? styles.loading : ""
                  }`}
                  disabled={isFormSubmitting}
                >
                  {isFormSubmitting ? (
                    <span className={styles.buttonLoader}></span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </Link>
            </form>

            <div className={styles.privacyNote}>
              By signing in, you agree to SuiTunes's{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>
            </div>

            <div className={styles.web3Note}>
              <p>First time using Web3?</p>
              <a href="#" className={styles.learnMoreLink}>
                Learn more about zkLogin
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
