import { topCategories } from '../data/products';

function TopCategories({ selectedCategory, onSelect }) {
  return (
    <nav className="top-categories" aria-label="Shop departments">
      {topCategories.map((category) => (
        <button
          className={`top-category${selectedCategory === category.id ? ' active' : ''}`}
          key={category.name}
          type="button"
          aria-pressed={selectedCategory === category.id}
          onClick={() => onSelect(category.id)}
        >
          <span className="top-category-icon" aria-hidden="true">{category.icon}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </nav>
  );
}

export default TopCategories;
