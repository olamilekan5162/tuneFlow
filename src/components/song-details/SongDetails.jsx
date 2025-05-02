import styles from './SongDetails.module.css';
import PlayerControls from '../player-controls/PlayerControls';
import AudioVisualizer from '../audio-visualizer/AudioVisualizer';
import { Link } from 'react-router-dom';


const SongDetails = ({ songData, isPlaying, isPremium, handleVote}) => {
  
  return (
    <div className={styles.container}>
      <div className={styles.albumArt}>
        <img 
          src={songData.fields.music_art} 
          alt="Album Cover" 
          className={styles.albumImg}
        />
        <div className={styles.qualityBadge}>
          {isPremium ? "Premium" : "Standard"}
        </div>
        {isPlaying && (
          <div className={styles.playingIndicator}>
            <div className={styles.playingIcon}></div>
            <span>Now playing</span>
          </div>
        )}
      </div>
      
      <div className={styles.details}>
        <h1 className={styles.title}>{songData.fields.title}</h1>
        <div className={styles.artist}>
          By <Link to={`/profile/${songData.fields.artist}`} className={styles.artistLink}>{`${songData.fields.artist.slice(0,5)}...${songData.fields.artist.slice(-5)}`}</Link>
          <div className={styles.artistBadge}>Verified Artist</div>
        </div>
        
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}>♪</span>
            <span>4:15</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}>👁️</span>
            <span>{5} plays</span>
          </div>
          <div className={`${styles.metaItem} ${styles.vote}`}>
            <span className={styles.metaIcon}>❤️</span>
            <span onClick={handleVote}>{songData.fields.vote_count} Votes</span>
          </div>
        </div>
        
        <p className={styles.description}>
          {songData.fields.description}
        </p>
        
        <div className={styles.tags}>
          <span className={styles.tag}>{songData.fields.genre}</span>
        </div>

        <div>

        <AudioVisualizer/>
        <PlayerControls songData={songData} />
        </div>
      </div>
    </div>
  );
};

export default SongDetails;