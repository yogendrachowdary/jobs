import React from "react";
import UploadForm from "./components/UploadForm";
import ToastProvider from "./components/ToastProvider";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
      <ToastProvider />
      <UploadForm />
    </div>
  );
};

export default App;
