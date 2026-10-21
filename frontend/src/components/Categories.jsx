import { categories } from '../data/products';

function Categories({ selectedSubcategory, onSelect }) {
  const groups = [...new Set(categories.map((category) => category.group))];

  return (
    <section className="categories category-browser" id="categories" aria-label="Browse product categories">
      {groups.map((group) => (
        <div className="category-group" key={group}>
          <h2>{group}</h2>
          <div className="category-grid">
            {categories.filter((category) => category.group === group).map((category) => (
              <button
                className={`category-card${selectedSubcategory === category.id ? ' selected' : ''}`}
                key={category.id}
                type="button"
                aria-pressed={selectedSubcategory === category.id}
                onClick={() => onSelect(selectedSubcategory === category.id ? null : category.id)}
              >
                <span className="category-icon" aria-hidden="true">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default Categories;
