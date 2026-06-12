import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { diapersAPI } from '../api';
import { LoadingSkeleton, EmptyState } from '../components/Feedback';

export default function Home() {
  const [diapers, setDiapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadDiapers();
  }, [search, selectedBrand, page]);

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadDiapers() {
    try {
      setLoading(true);
      const data = await diapersAPI.list({
        search: search || undefined,
        brand: selectedBrand || undefined,
        page,
        limit: 20,
      });
      setDiapers(data.diapers || []);
      setPagination(data.pagination);
    } catch (e) {
      console.error('Failed to load diapers:', e);
    } finally {
      setLoading(false);
    }
  }

  async function loadBrands() {
    try {
      const data = await diapersAPI.brands();
      setBrands(data.brands || []);
    } catch (e) {
      console.error('Failed to load brands:', e);
    }
  }

  return (
    <div className="px-3 py-4">
      {/* 搜索栏 */}
      <div className="mb-4">
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="搜索纸尿裤..."
            className="form-control"
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {/* 品牌筛选 */}
      {brands.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => { setSelectedBrand(''); setPage(1); }}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: !selectedBrand ? 'var(--primary)' : 'var(--bg-card)',
              color: !selectedBrand ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${!selectedBrand ? 'var(--primary)' : 'var(--border)'}`,
              cursor: 'pointer',
            }}
          >
            全部
          </button>
          {brands.map(b => (
            <button
              key={b}
              onClick={() => { setSelectedBrand(b); setPage(1); }}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: selectedBrand === b ? 'var(--primary)' : 'var(--bg-card)',
                color: selectedBrand === b ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${selectedBrand === b ? 'var(--primary)' : 'var(--border)'}`,
                cursor: 'pointer',
              }}
            >
              {b}
            </button>
          ))}
        </div>
      )}

      {/* 纸尿裤列表 */}
      {loading ? (
        <LoadingSkeleton count={5} height={80} />
      ) : diapers.length === 0 ? (
        <EmptyState icon="fa-baby" title="暂无纸尿裤" description="还没有收录任何纸尿裤" />
      ) : (
        <div className="space-y-3">
          {diapers.map(d => (
            <Link
              key={d.id}
              to={`/diaper/${d.id}`}
              className="block card"
              style={{ padding: '12px 14px', textDecoration: 'none' }}
            >
              <div className="flex items-center gap-3">
                {d.images?.length > 0 && (
                  <img src={d.images[0]} alt="" className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                      {d.brand} {d.model}
                    </span>
                    {d.is_baby_diaper ? (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,183,197,0.2)', color: 'var(--accent-dark)' }}>婴儿</span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {d.avg_score > 0 && (
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-star" style={{ color: 'var(--warning)', fontSize: '10px' }} />
                        {d.avg_score}
                      </span>
                    )}
                    {d.rating_count > 0 && (
                      <span>{d.rating_count} 评价</span>
                    )}
                    {d.absorbency_adult && (
                      <span className="truncate">{d.absorbency_adult}</span>
                    )}
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right flex-shrink-0" style={{ color: 'var(--text-muted)', fontSize: '12px' }} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 分页 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-outline btn-sm"
          >
            <i className="fa-solid fa-chevron-left mr-1" />上一页
          </button>
          <span className="text-sm flex items-center px-3" style={{ color: 'var(--text-muted)' }}>
            {page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="btn btn-outline btn-sm"
          >
            下一页<i className="fa-solid fa-chevron-right ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
