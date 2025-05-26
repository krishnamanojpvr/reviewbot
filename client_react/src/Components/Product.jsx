import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../Hooks/interceptor';
import Loader from '../Components/Loader';

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await api.get(`/api/product/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError('Failed to load product details');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const getSentimentPercentage = (type) => {
    if (!product?.summary_details) return 0;
    const total = product.summary_details.review_count || 1;
    return Math.round((product.sentiment_details[type] / total) * 100);
  };

//   const getRatingPercentage = () => {
//     if (!product?.product_details?.rating) return 0;
//     const rating = parseFloat(product.product_details.rating.split(' ')[0]);
//     return (rating / 5) * 100;
//   };

  const sendQuery = async () => {
    const query = chatInput.trim();
    if (!query || chatLoading) return;

    const payload = {
      product_id: id,
      query: query
    };

    // Add user message immediately with loading state
    setMessages([...messages, { query, response: 'Loading...' }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await api.post('/api/query', payload);
      // Update the last message with the response
      setMessages(prev =>
        prev.map((msg, i) =>
          i === prev.length - 1 ? { ...msg, response: response.data } : msg
        )
      );
    } catch (err) {
      console.error('Query failed:', err);
      // Update the last message with error
      setMessages(prev =>
        prev.map((msg, i) =>
          i === prev.length - 1
            ? { ...msg, response: 'Sorry, something went wrong.' }
            : msg
        )
      );
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
        <Loader isLoading={loading} />

        {error && !loading && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {product && !loading && (
          <>
            <div className="flex flex-col lg:flex-row gap-8 w-full">
              <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 flex-shrink-0 w-full lg:w-96 flex items-center justify-center">
                <img
                  src={product.product_details.image}
                  alt={product.product_details.name}
                  className="object-contain h-80 w-full max-w-full bg-gray-900 p-4"
                />
              </div>

              <div className="flex-1">
                <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 flex flex-col gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-fuchsia-200 break-words">
                      {product.product_details.name}
                    </h1>
                    <div className="flex flex-wrap items-center mt-2 gap-3">
                      <span className="text-2xl font-bold text-white">
                        {product.product_details.price}Rs
                      </span>
                      <span className="text-yellow-400 font-medium flex items-center gap-1">
                        <svg
                          className="h-5 w-5 inline"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.176c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.54 1.118l-3.381-2.455a1 1 0 00-1.175 0l-3.381 2.455c-.785.57-1.84-.197-1.54-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.049 9.397c-.783-.57-.38-1.81.588-1.81h4.176a1 1 0 00.95-.69l1.286-3.97z" />
                        </svg>
                        {product.product_details.rating}
                      </span>
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-fuchsia-400 hover:text-fuchsia-300 text-sm underline"
                      >
                        View on Amazon
                      </a>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-fuchsia-200 mb-2">
                      About this item
                    </h3>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      {product.product_details.about.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 flex flex-col justify-between min-h-[160px]">
                <h3 className="text-xl font-bold text-fuchsia-200 mb-3">
                  Summary
                </h3>
                <p className="text-gray-300">
                  {product.summary_details.summary_text}
                </p>
              </div>

              <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 flex flex-col justify-between min-h-[160px]">
                <h3 className="text-xl font-bold text-fuchsia-200 mb-3">
                  Reviews Distribution
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-400">Positive</span>
                      <span className="text-green-400">
                        {product.sentiment_details.positive}/
                        {product.summary_details.review_count} reviews
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${getSentimentPercentage('positive')}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-yellow-400">Neutral</span>
                      <span className="text-yellow-400">
                        {product.sentiment_details.neutral}/
                        {product.summary_details.review_count} reviews
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500"
                        style={{
                          width: `${getSentimentPercentage('neutral')}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-400">Negative</span>
                      <span className="text-red-400">
                        {product.sentiment_details.negative}/
                        {product.summary_details.review_count} reviews
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{
                          width: `${getSentimentPercentage('negative')}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full">
              <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6 space-y-4">
                <h3 className="text-xl font-bold text-fuchsia-200 mb-3">
                  Ask a Question
                </h3>

                <div
                  ref={chatContainerRef}
                  className="space-y-4 max-h-60 overflow-y-auto pr-2"
                >
                  {messages.map((msg, i) => (
                    <div key={i}>
                      <div className="flex justify-end">
                        <div className="flex items-center gap-2 max-w-[80%]">
                          <div className="bg-fuchsia-700/30 text-fuchsia-100 px-4 py-2 rounded-xl shadow text-sm break-words">
                            {msg.query}
                          </div>
                          <span className="text-fuchsia-400">
                            <svg
                              viewBox="0 0 1024 1024"
                              className="h-5 w-5"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="#000000"
                            >
                              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                              <g
                                id="SVGRepo_tracerCarrier"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></g>
                              <g id="SVGRepo_iconCarrier">
                                <path
                                  d="M691.573 338.89c-1.282 109.275-89.055 197.047-198.33 198.331-109.292 1.282-197.065-90.984-198.325-198.331-0.809-68.918-107.758-68.998-106.948 0 1.968 167.591 137.681 303.31 305.272 305.278C660.85 646.136 796.587 503.52 798.521 338.89c0.811-68.998-106.136-68.918-106.948 0z"
                                  fill="#4A5699"
                                ></path>
                                <path
                                  d="M294.918 325.158c1.283-109.272 89.051-197.047 198.325-198.33 109.292-1.283 197.068 90.983 198.33 198.33 0.812 68.919 107.759 68.998 106.948 0C796.555 157.567 660.839 21.842 493.243 19.88c-167.604-1.963-303.341 140.65-305.272 305.278-0.811 68.998 106.139 68.919 106.947 0z"
                                  fill="#C45FA0"
                                ></path>
                                <path
                                  d="M222.324 959.994c0.65-74.688 29.145-144.534 80.868-197.979 53.219-54.995 126.117-84.134 201.904-84.794 74.199-0.646 145.202 29.791 197.979 80.867 54.995 53.219 84.13 126.119 84.79 201.905 0.603 68.932 107.549 68.99 106.947 0-1.857-213.527-176.184-387.865-389.716-389.721-213.551-1.854-387.885 178.986-389.721 389.721-0.601 68.991 106.349 68.933 106.949 0.001z"
                                  fill="#E5594F"
                                ></path>
                              </g>
                            </svg>
                          </span>
                        </div>
                      </div>

                      <div className="h-2"></div>

                      <div className="flex justify-start">
                        <div className="flex items-center gap-2 max-w-[80%]">
                          <span className="text-indigo-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 mr-2 text-fuchsia-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </span>
                          <div className="bg-gray-700 text-gray-100 px-4 py-2 rounded-xl shadow text-sm break-words flex items-center">
                            <span>{msg.response}</span>
                            {msg.response === 'Loading...' && (
                              <svg
                                className="animate-spin h-5 w-5 text-fuchsia-400 ml-2"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8z"
                                ></path>
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2 items-center">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendQuery()}
                    placeholder="Type your question..."
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring focus:ring-fuchsia-500"
                    disabled={chatLoading}
                  />
                  <button
                    onClick={sendQuery}
                    disabled={chatLoading || !chatInput.trim()}
                    className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-4 py-2 rounded-lg flex items-center justify-center transition disabled:opacity-50"
                    aria-label="Send"
                    type="button"
                  >
                    <svg
                      fill="#ffffff"
                      className="w-5 h-5"
                      stroke="currentColor"
                      version="1.1"
                      id="Capa_1"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      viewBox="0 0 495.003 495.003"
                      xmlSpace="preserve"
                    >
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        <g id="XMLID_51_">
                          <path
                            id="XMLID_53_"
                            d="M164.711,456.687c0,2.966,1.647,5.686,4.266,7.072c2.617,1.385,5.799,1.207,8.245-0.468l55.09-37.616 l-67.6-32.22V456.687z"
                          ></path>
                          <path
                            id="XMLID_52_"
                            d="M492.431,32.443c-1.513-1.395-3.466-2.125-5.44-2.125c-1.19,0-2.377,0.264-3.5,0.816L7.905,264.422 c-4.861,2.389-7.937,7.353-7.904,12.783c0.033,5.423,3.161,10.353,8.057,12.689l125.342,59.724l250.62-205.99L164.455,364.414 l156.145,74.4c1.918,0.919,4.012,1.376,6.084,1.376c1.768,0,3.519-0.322,5.186-0.977c3.637-1.438,6.527-4.318,7.97-7.956 L494.436,41.257C495.66,38.188,494.862,34.679,492.431,32.443z"
                          ></path>
                        </g>
                      </g>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Product;