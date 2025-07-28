import RecommendationCard from './RecommendationCard';

const RecommendationsSection = ({ recommendations }) => {
  const sectionTitles = {
    movie: '🎬 Movie Matches',
    tv_show: '📺 TV Show Matches',
    book: '📚 Book Matches',
    brand: '🏷️ Brand Matches',
    person: '👤 People You Might Like'
  };

  // Only show sections that have recommendations
  const activeSections = Object.entries(recommendations)
    .filter(([_, items]) => items && items.length > 0);

  if (activeSections.length === 0) return null;

  return (
    <div className="mt-8 space-y-8">
      {activeSections.map(([type, items]) => (
        <div key={type} className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            {sectionTitles[type] || `${type.charAt(0).toUpperCase() + type.slice(1)} Matches`}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item, index) => (
              <RecommendationCard 
                key={`${type}-${index}`} 
                item={item} 
                type={type}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecommendationsSection;
