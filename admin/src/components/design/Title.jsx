export const TitleS = ({ children }) => {
  return <h3 className="text-primary capitalize font-medium">{children}</h3>;
};
export const TitleSm = ({ children }) => {
  return <h2 className="text-primary uppercase font-semibold">{children}</h2>;
};
export const TitleMd = ({ children }) => {
  return <h1 className="text-2xl text-dark font-semibold"> {children}</h1>;
};
export const Description = ({ children }) => {
  return <span className="text-[14px] capitalize text-gray-500"> {children}</span>;
};
export const Caption = ({ children }) => {
  return <span className="text-s capitalize"> {children}</span>;
};
