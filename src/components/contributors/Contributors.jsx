
import React from 'react';
import styles from './Contributors.module.css';
import Jazzicon from 'react-jazzicon'

const Contributors = ({ contributors }) => {
  return (
    <section className={styles.contributors}>
      <h2 className={styles.sectionTitle}>Contributors</h2>
      <div className={styles.contributorsList}>
        {contributors?.map((contributor, index) => (
          <div key={index} className={styles.contributorCard}>
            <Jazzicon diameter={50} seed={contributor}/>
            <div className={styles.contributorInfo}>
              <h3 className={styles.contributorName}>{`${contributor.slice(0,5)}...${contributor.slice(-5)}`}</h3>
              {/* <p className={styles.contributorRole}>{contributor.role}</p> */}
              {/* <p className={styles.contributorShare}>{contributor.share}% Share</p> */}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Contributors;