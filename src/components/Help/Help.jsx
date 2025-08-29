import React from "react";

function Help() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-gray-800">Help Center</h1>

      {/* QnA Section */}
      <section className="bg-white rounded-xl shadow p-4 transition-all duration-300 ease-in-out  hover:scale-101 hover:shadow-sm hover:bg-grey-50">
        <h2 className="text-xl font-semibold mb-3">Q&A</h2>
        <ul className="space-y-2 text-gray-700">
          <li>
            <strong>Q:</strong> How do I reset my password? <br />
            <strong>A:</strong> Go to settings → security → reset password.
          </li>
          <li>
            <strong>Q:</strong> Can I use the app offline? <br />
            <strong>A:</strong> Yes, but some features require an internet
            connection.
          </li>
        </ul>
      </section>

      {/* FAQ Section */}
      <section className="bg-white rounded-xl shadow p-4 transition-all duration-300 ease-in-out  hover:scale-101 hover:shadow-sm hover:bg-grey-50">
        <h2 className="text-xl font-semibold mb-3">FAQs</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>How do I contact support?</li>
          <li>Where can I update my profile information?</li>
          <li>Is my data secure?</li>
        </ul>
      </section>
      <button
  onClick={() => window.open("https://www.caterpillar.com/en/company.html", "_blank")}
  className="px-4 py-2 font-medium bg-stone-200 rounded-lg 
             transition-all duration-300 ease-in-out 
             hover:bg-stone-300 hover:scale-105 hover:shadow-md"
>
  More About Us !
</button>


      {/* Floating Chatbot Button */}
      <button
        onClick={() => window.open("https://887367476ce5.ngrok-free.app/", "_blank")}
        className="fixed bottom-6 right-6 bg-violet-600 text-white rounded-full shadow-lg p-4 transition-all duration-300 ease-in-out hover:bg-violet-700 hover:scale-110 hover:shadow-xl"
      >
        💬
      </button>
    </div>
  );
}

export default Help;
