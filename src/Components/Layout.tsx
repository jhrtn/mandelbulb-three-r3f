export const TextLink = ({
  url,
  children,
}: {
  url: string;
  children: React.ReactChild;
}) => (
  <a href={url} target="_blank" rel="noreferrer">
    {children}
  </a>
);

export const Centered = ({ children }: { children: React.ReactChild }) => (
  <div className="loader-outer">
    <div className="loader-inner">{children}</div>
  </div>
);
