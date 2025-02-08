// src/components/Card.jsx

export const Card = ({ children, className }) => {
  return <div className={`card ${className}`}>{children}</div>;
};

export const CardHeader = ({ children, className }) => {
  return <div className={`card-header ${className}`}>{children}</div>;
};

export const CardContent = ({ children, className }) => {
  return <div className={`card-content ${className}`}>{children}</div>;
};

export const CardTitle = ({ children }) => {
  return <h3 className="card-title">{children}</h3>;
};
