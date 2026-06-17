// import React, { useState, useEffect } from 'react';
// import { masterApi } from '../api';
// import { Spinner } from '../components/UI';

// export default function ServiceCatalogPage({ onSelectService }) {
//   const [types,       setTypes]       = useState([]);
//   const [selectedType,setSelectedType]= useState(null);
//   const [categories,  setCategories]  = useState([]);
//   const [selectedCat, setSelectedCat] = useState(null);
//   const [subcats,     setSubcats]     = useState([]);
//   const [loading,     setLoading]     = useState(true);
//   const [catLoading,  setCatLoading]  = useState(false);
//   const [subLoading,  setSubLoading]  = useState(false);
//   const [search,      setSearch]      = useState('');

//   useEffect(() => {
//     masterApi.getTypes()
//       .then(d => setTypes(Array.isArray(d) ? d : []))
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   }, []);

//   const onType = async (t) => {
//     setSelectedType(t); setSelectedCat(null); setSubcats([]);
//     setCatLoading(true);
//     try { setCategories(Array.isArray(await masterApi.getCategories(t.typeId)) ? await masterApi.getCategories(t.typeId) : []); }
//     catch { setCategories([]); }
//     setCatLoading(false);
//   };

//   const onCat = async (c) => {
//     setSelectedCat(c);
//     setSubLoading(true);
//     try { setSubcats(Array.isArray(await masterApi.getSubcategories(c.categoryId)) ? await masterApi.getSubcategories(c.categoryId) : []); }
//     catch { setSubcats([]); }
//     setSubLoading(false);
//   };

//   const filtered = types.filter(t => !search || t.typeName?.toLowerCase().includes(search.toLowerCase()));

//   return (
//     <div>
//       <div className="page-header">
//         <div className="page-header__breadcrumb">
//           <span>Service Catalog</span>
//         </div>
//         <div className="page-header__title">Service Catalog</div>
//         <div className="page-header__sub">Browse and request services — select a sub-category to raise a ticket</div>
//       </div>
//       <div className="search-bar">
//         <span className="search-bar__icon">
//           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
//         </span>
//         <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
//       </div>

//       {loading ? <Spinner /> : (
//         <div className="catalog-grid">
//           <div className="catalog-col">
//             <div className="catalog-col__header">Service Types</div>
//             {filtered.length === 0 && <div className="text-muted">No service types found</div>}
//             {filtered.map(t => (
//               <div key={t.typeId} className={`catalog-item${selectedType?.typeId === t.typeId ? ' selected' : ''}`} onClick={() => onType(t)}>
//                 <span className="catalog-item__name">{t.typeName}</span>
//                 <span className="catalog-item__arrow">›</span>
//               </div>
//             ))}
//           </div>
//           <div className="catalog-divider" />
//           <div className="catalog-col">
//             <div className="catalog-col__header">Categories</div>
//             {!selectedType && <div className="text-muted">Select a service type</div>}
//             {catLoading && <Spinner />}
//             {!catLoading && selectedType && categories.length === 0 && <div className="text-muted">No categories found</div>}
//             {!catLoading && categories.map(c => (
//               <div key={c.categoryId} className={`catalog-item${selectedCat?.categoryId === c.categoryId ? ' selected' : ''}`} onClick={() => onCat(c)}>
//                 <span className="catalog-item__name">{c.categoryName}</span>
//                 <span className="catalog-item__arrow">›</span>
//               </div>
//             ))}
//           </div>
//           <div className="catalog-divider" />
//           <div className="catalog-col">
//             <div className="catalog-col__header">Sub-Categories</div>
//             {!selectedCat && <div className="text-muted">Select a category</div>}
//             {subLoading && <Spinner />}
//             {!subLoading && selectedCat && subcats.length === 0 && <div className="text-muted">No sub-categories found</div>}
//             {!subLoading && subcats.map(s => (
//               <div key={s.subcategoryId} className="catalog-item leaf" onClick={() => onSelectService({ category: selectedCat, subCategory: s })}>
//                 <span className="catalog-item__name">{s.subcategoryName}</span>
//                 <span className="catalog-item__arrow" style={{ color: 'var(--accent-900)', fontWeight: 700 }}>Create Ticket ›</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




import React, { useState, useEffect } from 'react';
import { masterApi } from '../api';
import { Spinner } from '../components/UI';

// The typeName used in DB for incident tickets. Adjust if your seed data differs.
const INCIDENT_TYPE_NAME = 'Incident';

export default function ServiceCatalogPage({ onSelectService }) {
  const [types,        setTypes]        = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [categories,   setCategories]   = useState([]);
  const [selectedCat,  setSelectedCat]  = useState(null);
  const [subcats,      setSubcats]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [catLoading,   setCatLoading]   = useState(false);
  const [subLoading,   setSubLoading]   = useState(false);
  const [search,       setSearch]       = useState('');

  const isIncidentType = selectedType?.typeName?.toLowerCase() === INCIDENT_TYPE_NAME.toLowerCase();

  useEffect(() => {
    masterApi.getTypes()
      .then(d => setTypes(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onType = async (t) => {
    setSelectedType(t);
    setSelectedCat(null);
    setSubcats([]);
    setCatLoading(true);
    try {
      const cats = await masterApi.getCategories(t.typeId);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch {
      setCategories([]);
    }
    setCatLoading(false);
  };

  const onCat = async (c) => {
    setSelectedCat(c);
    setSubLoading(true);
    try {
      const subs = await masterApi.getSubcategories(c.categoryId);
      setSubcats(Array.isArray(subs) ? subs : []);
    } catch {
      setSubcats([]);
    }
    setSubLoading(false);
  };

  /**
   * Called when user clicks a sub-category leaf.
   * For Incident type → route to CreateIncidentPage.
   * For all other types → route to CreateTicketPage (existing flow).
   */
  const onSubcat = (s) => {
    onSelectService({
      category:    selectedCat,
      subCategory: s,
      ticketType:  selectedType,
      isIncident:  isIncidentType,
    });
  };

  const filtered = types.filter(t =>
    !search || t.typeName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header__breadcrumb">
          <span>Service Catalog</span>
        </div>
        <div className="page-header__title">Service Catalog</div>
        <div className="page-header__sub">
          Browse and request services — select a sub-category to raise a ticket
        </div>
      </div>

      <div className="search-bar">
        <span className="search-bar__icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
        />
      </div>

      {loading ? <Spinner /> : (
        <div className="catalog-grid">
          {/* ── Column 1: Service Types ── */}
          <div className="catalog-col">
            <div className="catalog-col__header">Service Types</div>
            {filtered.length === 0 && (
              <div className="text-muted">No service types found</div>
            )}
            {filtered.map(t => (
              <div
                key={t.typeId}
                className={`catalog-item${selectedType?.typeId === t.typeId ? ' selected' : ''}`}
                onClick={() => onType(t)}
              >
                <span className="catalog-item__name">{t.typeName}</span>
                <span className="catalog-item__arrow">›</span>
              </div>
            ))}
          </div>

          <div className="catalog-divider" />

          {/* ── Column 2: Categories ── */}
          <div className="catalog-col">
            <div className="catalog-col__header">Categories</div>
            {!selectedType && <div className="text-muted">Select a service type</div>}
            {catLoading && <Spinner />}
            {!catLoading && selectedType && categories.length === 0 && (
              <div className="text-muted">No categories found</div>
            )}
            {!catLoading && categories.map(c => (
              <div
                key={c.categoryId}
                className={`catalog-item${selectedCat?.categoryId === c.categoryId ? ' selected' : ''}`}
                onClick={() => onCat(c)}
              >
                <span className="catalog-item__name">{c.categoryName}</span>
                <span className="catalog-item__arrow">›</span>
              </div>
            ))}
          </div>

          <div className="catalog-divider" />

          {/* ── Column 3: Sub-Categories ── */}
          <div className="catalog-col">
            <div className="catalog-col__header">Sub-Categories</div>
            {!selectedCat && <div className="text-muted">Select a category</div>}
            {subLoading && <Spinner />}
            {!subLoading && selectedCat && subcats.length === 0 && (
              <div className="text-muted">No sub-categories found</div>
            )}
            {!subLoading && subcats.map(s => (
              <div
                key={s.subcategoryId}
                className="catalog-item leaf"
                onClick={() => onSubcat(s)}
              >
                <span className="catalog-item__name">{s.subcategoryName}</span>
                <span
                  className="catalog-item__arrow"
                  style={{ color: 'var(--accent-900)', fontWeight: 700 }}
                >
                  {isIncidentType ? 'Report Incident ›' : 'Create Ticket ›'}
                </span>
              </div>
            ))}
          </div>

          {/* ── Column 4: Items — HIDDEN for Incident type ── */}
          {!isIncidentType && (
            <>
              <div className="catalog-divider" />
              <div className="catalog-col">
                <div className="catalog-col__header">Items</div>
                <div className="text-muted">Select a sub-category</div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
