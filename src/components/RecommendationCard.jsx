const RecommendationCard = ({ item, type }) => {
  const getTypeLabel = () => {
    const labels = {
      movie: '🎬 Movie',
      tv_show: '📺 TV Show',
      book: '📚 Book',
      brand: '🏷️ Brand',
      person: '👤 Person'
    };
    return labels[type] || type;
  };

  const getFallbackImage = () => {
    // Use the centralized getFallbackImage from api.js
    const name = item?.name || '';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || type)}&background=1e40af&color=fff&size=200&bold=true&length=2`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
      <div className="relative h-48 bg-gray-200">
        <img
          src={item.image_url || getFallbackImage()}
          alt={item.name || 'Recommendation'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getFallbackImage();
          }}
        />
        <div className="absolute top-2 right-2 bg-cyan-600 text-white text-xs px-2 py-1 rounded-full">
          {getTypeLabel()}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{item.name || 'Untitled'}</h3>
        {item.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-2">{item.description}</p>
        )}
        {item.genres && item.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.genres.slice(0, 3).map((genre, index) => (
              <span 
                key={index} 
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;
