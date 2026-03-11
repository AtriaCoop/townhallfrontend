import {
  FaLinkedin,
  FaSquareXTwitter,
  FaSquareInstagram,
  FaSquareFacebook,
} from "react-icons/fa6";
import styles from "./SocialLinks.module.scss";

export default function SocialLinks({ socialLinks }) {
  const links = [
    {
      url: socialLinks.linkedin_url,
      icon: <FaLinkedin />,
      name: "LinkedIn",
    },
    {
      url: socialLinks.x_url,
      icon: <FaSquareXTwitter />,
      name: "X",
    },
    {
      url: socialLinks.facebook_url,
      icon: <FaSquareFacebook />,
      name: "Facebook",
    },
    {
      url: socialLinks.instagram_url,
      icon: <FaSquareInstagram />,
      name: "Instagram",
    },
  ];

  return (
    <div className={`${styles.socialLinks} socialLinks`}>
      {links
        .filter((link) => !!link.url)
        .map(({ url, icon, name }) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            title={name}
          >
            {icon}
          </a>
        ))}
    </div>
  );
}
