import styles from './Post.module.scss';

export default function Post({ userName, organization, date, content, links, likes, comments }) {
  return (
    <div className={styles.post}>
      <div className={styles.postHeader}>
        <img src="/assets/test.png" alt="User profile" className={styles.profilePic} />
        <div className={styles.postInfo}>
          <div className={styles.userName}>{userName}</div>
          <div className={styles.organizationName}>{organization}</div>
          <div className={styles.date}>{date}</div>
        </div>
      </div>

      <div className={styles.postContent}>
        {content.map((p, i) => <p key={i}>{p}</p>)}
        {links.map((link, i) => (
          <a href={link.href} target="_blank" key={i}>{link.text}</a>
        ))}
      </div>

      <div className={styles.postFooter}>
        <div className={styles.reactions}>
          <img src="/assets/like.svg" alt="like" />
          <img src="/assets/comment.svg" alt="comment" />
        </div>
        <div className={styles.likesComments}>
          {likes} Likes · {comments} Comment{comments !== 1 && 's'}
        </div>
      </div>
    </div>
  );
}
