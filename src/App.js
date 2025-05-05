import React from "react";
import UploadForm from "./components/UploadForm";
import ToastProvider from "./components/ToastProvider";
import "./App.css";


const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
      <ToastProvider />
      
      <header className="bg-blue-600 text-white py-8 text-center shadow-lg">
        <h1 className="text-3xl font-bold">
          Discover Your Dream Job with AI
        </h1>
        <p className="mt-2 text-xl">
          Upload your resume, and let our AI-powered tool find the best job matches for you.
        </p>
      </header>
      
      <UploadForm />
    </div>
  );
};

export default App;
