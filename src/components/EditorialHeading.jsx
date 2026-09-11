export function EditorialHeading({
  as: Tag = "header",
  className = "",
  meta,
  title,
  intro,
  detail,
  titleId,
  titleTag: Heading = "h2",
  tone = "light",
  motion = false,
}) {
  return (
    <Tag className={`editorial-heading editorial-heading--${tone}${className ? ` ${className}` : ""}`}>
      {meta ? <p className="editorial-heading__meta" {...(motion ? { "data-motion-copy": true } : {})}>{meta}</p> : null}
      <Heading id={titleId} className="editorial-heading__title" {...(motion ? { "data-motion-heading": true } : {})}>{title}</Heading>
      <div className="editorial-heading__detail" {...(motion ? { "data-motion-copy": true } : {})}>
        {detail ?? (intro ? <p>{intro}</p> : null)}
      </div>
    </Tag>
  );
}
