import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-center items-center min-h-[70vh] py-12">
      {children}
    </div>
  );
};

export default AuthLayout;
