import Tag from '@/components/Tag/Tag';
import styles from './TagCreationField.module.scss';

export default function TagCreationField({
  tag,
  setTag,
  tags,
  setTags,
  tagErrorText,
  setTagErrorText,
}) {
  const MAX_TAGS = 5;

  const handleTagAdd = () => {
    if (!tag.trim()) return;
    if (tags.length >= MAX_TAGS) {
      setTagErrorText("Can't add more than 5 tags.");
      return;
    };

    const exists = tags.some(
      (t) => t.toLowerCase() === tag.toLowerCase()
    );
    if (exists) {
      setTagErrorText("Can't add duplicate tag.");
      return;
    };

    setTags((prev) => [...prev, tag]);
    setTag("");
    setTagErrorText("");
  }

  const removeTag = (idx) => {
    setTags((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className={styles.createTags}>
      <div className={styles.tagList}>
        {tags.map((tag, index) => (
          <Tag key={index} name={tag} onRemove={() => removeTag(index)} />
        ))}
      </div>

      <div className={styles.tagInputFields}>
        <input placeholder={"Add a tag"} className={styles.tagInput} value={tag} onChange={(e) => setTag(e.target.value)} />
        <button className={styles.tagAddButton} onClick={handleTagAdd}>ADD</button>
      </div>

      <div>
        {tagErrorText.length > 0 && (
          <span className={styles.tagWarning}>{tagErrorText}</span>
        )}
      </div>
    </div>
  )
}