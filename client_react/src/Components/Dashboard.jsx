import { useState, useEffect } from 'react';
import api from '../Hooks/interceptor';
import Loader from '../Components/Loader';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/api/products');
        setProducts(response.data);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-fuchsia-200 mb-8">Dashboard</h1>
        
        <Loader isLoading={loading} />

        {error && !loading && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {products.length > 0 && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-gray-800/60 border border-gray-700 rounded-xl p-6 hover:shadow-lg hover:shadow-fuchsia-900/20 transition duration-300"
              >
                <h3 className="text-xl font-bold text-fuchsia-200 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-300 mb-4">{product.summary}</p>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-400 flex items-center">
                    <svg
                      className="h-5 w-5 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.176c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.54 1.118l-3.381-2.455a1 1 0 00-1.175 0l-3.381 2.455c-.785.57-1.84-.197-1.54-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.049 9.397c-.783-.57-.38-1.81.588-1.81h4.176a1 1 0 00.95-.69l1.286-3.97z" />
                    </svg>
                    {product.rating}
                  </span>
                  <a
                    href={`/product/${product.id}`}
                    className="text-fuchsia-400 hover:text-fuchsia-300 text-sm font-medium"
                  >
                    View Details →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {products.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-gray-400">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;