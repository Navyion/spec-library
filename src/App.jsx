import { useState, useEffect, useRef } from "react";

var AUTH_KEY = "a3dd2a98445cf098d6ed8431cda01e18f734368f1509c3f06fe4190330c576c5";

function parseXML(xmlText) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(xmlText, "text/xml");

  var totalStr = doc.querySelector("total");
  var total = totalStr ? parseInt(totalStr.textContent, 10) : 0;

  var items = doc.querySelectorAll("result > item");
  var books = [];

  items.forEach(function(item) {
    var get = function(tag) {
      var el = item.querySelector(tag);
      return el ? el.textContent.trim() : "";
    };
    books.push({
      title: get("title_info") || get("title") || "제목 없음",
      author: get("author_info") || get("author") || "",
      publisher: get("pub_info") || get("publisher") || "",
      pubYear: get("pub_year_info") || get("pub_year") || "",
      callNo: get("call_no") || "",
      controlNo: get("control_no") || "",
      typeCode: get("type_code") || "",
      typeName: get("type_name") || "단행본",
      imageUrl: get("image_url") || "",
    });
  });

  return { total: total, books: books };
}

async function fetchBooks(query, pageNum) {
  var url =
    "/api/search.do" +
    "?key=" + AUTH_KEY +
    "&apiType=xml" +
    "&srchTarget=total" +
    "&kwd=" + encodeURIComponent(query) +
    "&pageSize=10" +
    "&pageNum=" + (pageNum || 1);

  var response = await fetch(url);
  if (!response.ok) throw new Error("API 오류: " + response.status);

  var xmlText = await response.text();

  if (xmlText.indexOf("인증") > -1 && xmlText.indexOf("오류") > -1) {
    throw new Error("인증키 오류 — 관리자 승인을 확인해주세요.");
  }

  return parseXML(xmlText);
}

function BookCard({ book, index }) {
  var [imgError, setImgError] = useState(false);

  return (
    <div className="book-card" style={{ animationDelay: index * 60 + "ms" }}>
      <div className="book-cover">
        {book.imageUrl && !imgError ? (
          <img src={book.imageUrl} alt={book.title} onError={function() { setImgError(true); }} />
        ) : (
          <div className="cover-placeholder">
            <span className="cover-icon">冊</span>
          </div>
        )}
      </div>
      <div className="book-info">
        <span className="book-type">{book.typeName}</span>
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author || "저자 미상"}</p>
        <div className="book-meta">
          {book.publisher && <span>{book.publisher}</span>}
          {book.pubYear && <span>{book.pubYear}</span>}
        </div>
        {book.callNo && <p className="book-isbn">{book.callNo}</p>}
      </div>
    </div>
  );
}

export default function LibrarySearch() {
  var [query, setQuery] = useState("");
  var [books, setBooks] = useState([]);
  var [total, setTotal] = useState(null);
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState(null);
  var [searched, setSearched] = useState(false);
  var inputRef = useRef(null);

  useEffect(function() { inputRef.current?.focus(); }, []);

  var handleSearch = async function() {
    var trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setBooks([]);
    setSearched(true);
    try {
      var result = await fetchBooks(trimmed, 1);
      setBooks(result.books);
      setTotal(result.total);
    } catch (err) {
      setError(err.message || "검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  var handleKeyDown = function(e) { if (e.key === "Enter") handleSearch(); };

  return (
    <>
      <style>{"\
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;600;700&family=Noto+Sans+KR:wght@300;400;500&family=IM+Fell+English+SC&display=swap');\
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\
        body { background: #0e0c08; min-height: 100vh; font-family: 'Noto Sans KR', sans-serif; }\
        .app {\
          min-height: 100vh;\
          background:\
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(200,169,110,0.12) 0%, transparent 70%),\
            repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(200,169,110,0.03) 80px, rgba(200,169,110,0.03) 81px),\
            #0e0c08;\
          color: #e8dfc8;\
        }\
        .header { text-align: center; padding: 60px 20px 40px; position: relative; }\
        .header::after { content: ''; display: block; width: 120px; height: 1px; background: linear-gradient(90deg, transparent, #c8a96e, transparent); margin: 28px auto 0; }\
        .header-label { font-family: 'IM Fell English SC', serif; font-size: 11px; letter-spacing: 4px; color: #c8a96e; text-transform: uppercase; margin-bottom: 16px; opacity: 0.8; }\
        .header-title { font-family: 'Noto Serif KR', serif; font-size: clamp(28px, 5vw, 46px); font-weight: 700; color: #f0e6cc; line-height: 1.2; letter-spacing: -0.5px; }\
        .header-title em { font-style: normal; color: #c8a96e; }\
        .header-sub { margin-top: 10px; font-size: 13px; color: #8a7f6a; font-weight: 300; letter-spacing: 1px; }\
        .search-section { max-width: 680px; margin: 0 auto; padding: 0 20px 48px; }\
        .search-box { display: flex; border: 1px solid rgba(200,169,110,0.3); border-radius: 4px; overflow: hidden; background: rgba(255,255,255,0.03); transition: border-color 0.3s; }\
        .search-box:focus-within { border-color: rgba(200,169,110,0.7); box-shadow: 0 0 0 3px rgba(200,169,110,0.08); }\
        .search-input { flex: 1; padding: 16px 20px; background: transparent; border: none; outline: none; font-size: 15px; font-family: 'Noto Sans KR', sans-serif; color: #e8dfc8; font-weight: 300; }\
        .search-input::placeholder { color: #5a5245; }\
        .search-btn { padding: 16px 28px; background: #c8a96e; border: none; cursor: pointer; font-family: 'Noto Serif KR', serif; font-size: 14px; font-weight: 600; color: #0e0c08; letter-spacing: 1px; transition: background 0.2s; white-space: nowrap; }\
        .search-btn:hover:not(:disabled) { background: #d4b87e; }\
        .search-btn:disabled { opacity: 0.5; cursor: not-allowed; }\
        .search-hint { margin-top: 10px; font-size: 12px; color: #4a4035; text-align: center; letter-spacing: 0.5px; }\
        .status-bar { max-width: 960px; margin: 0 auto 24px; padding: 0 24px; display: flex; align-items: center; gap: 12px; }\
        .status-count { font-family: 'Noto Serif KR', serif; font-size: 13px; color: #c8a96e; }\
        .status-line { flex: 1; height: 1px; background: rgba(200,169,110,0.15); }\
        .loading-wrap { text-align: center; padding: 80px 20px; }\
        .loading-spinner { display: inline-block; width: 36px; height: 36px; border: 2px solid rgba(200,169,110,0.2); border-top-color: #c8a96e; border-radius: 50%; animation: spin 0.9s linear infinite; margin-bottom: 20px; }\
        @keyframes spin { to { transform: rotate(360deg); } }\
        .loading-text { font-size: 13px; color: #6a6050; letter-spacing: 2px; }\
        .error-box { max-width: 500px; margin: 60px auto; padding: 28px; border: 1px solid rgba(200,80,80,0.3); border-radius: 4px; text-align: center; background: rgba(200,80,80,0.05); }\
        .error-icon { font-size: 28px; margin-bottom: 12px; }\
        .error-msg { font-size: 14px; color: #c87070; line-height: 1.6; }\
        .empty-box { text-align: center; padding: 80px 20px; color: #5a5245; }\
        .empty-icon { font-size: 40px; margin-bottom: 16px; opacity: 0.5; }\
        .empty-text { font-size: 14px; line-height: 1.8; }\
        .books-grid { max-width: 960px; margin: 0 auto; padding: 0 24px 80px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }\
        .book-card { display: flex; gap: 16px; padding: 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 4px; transition: transform 0.2s, border-color 0.2s, background 0.2s; animation: fadeUp 0.4s ease both; cursor: default; }\
        .book-card:hover { transform: translateY(-3px); border-color: rgba(200,169,110,0.25); background: rgba(200,169,110,0.04); }\
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }\
        .book-cover { flex-shrink: 0; width: 64px; height: 88px; border-radius: 3px; overflow: hidden; background: rgba(200,169,110,0.08); border: 1px solid rgba(200,169,110,0.15); }\
        .book-cover img { width: 100%; height: 100%; object-fit: cover; }\
        .cover-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }\
        .cover-icon { font-size: 24px; color: rgba(200,169,110,0.4); font-family: serif; }\
        .book-info { flex: 1; min-width: 0; }\
        .book-type { display: inline-block; font-size: 10px; letter-spacing: 1px; color: #c8a96e; border: 1px solid #c8a96e; padding: 2px 7px; border-radius: 2px; margin-bottom: 8px; opacity: 0.8; }\
        .book-title { font-family: 'Noto Serif KR', serif; font-size: 14px; font-weight: 600; color: #e8dfc8; line-height: 1.4; margin-bottom: 5px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }\
        .book-author { font-size: 12px; color: #8a7f6a; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\
        .book-meta { display: flex; gap: 8px; font-size: 11px; color: #5a5245; }\
        .book-meta span::after { content: '\\00B7'; margin-left: 8px; }\
        .book-meta span:last-child::after { content: ''; margin: 0; }\
        .book-isbn { margin-top: 6px; font-size: 10px; color: #4a4035; letter-spacing: 0.5px; font-family: monospace; }\
        .hero { text-align: center; padding: 40px 20px 80px; color: #4a4035; }\
        .hero-deco { font-family: 'IM Fell English SC', serif; font-size: 80px; line-height: 1; opacity: 0.06; margin-bottom: -20px; color: #c8a96e; }\
        .hero-text { font-size: 13px; line-height: 2; letter-spacing: 0.5px; }\
        @media (max-width: 600px) { .books-grid { grid-template-columns: 1fr; } .header { padding: 40px 20px 30px; } }\
      "}</style>

      <div className="app">
        <header className="header">
          <p className="header-label">National Library of Korea · Open API</p>
          <h1 className="header-title">국립중앙도서관<br /><em>소장자료 검색</em></h1>
          <p className="header-sub">국립중앙도서관 소장 자료를 검색합니다</p>
        </header>

        <section className="search-section">
          <div className="search-box">
            <input
              ref={inputRef}
              className="search-input"
              type="text"
              placeholder="검색어를 입력하세요 (예: 채식주의자, 토지, 인공지능)"
              value={query}
              onChange={function(e) { setQuery(e.target.value); }}
              onKeyDown={handleKeyDown}
            />
            <button className="search-btn" onClick={handleSearch} disabled={loading || !query.trim()}>
              {loading ? "검색 중…" : "검색"}
            </button>
          </div>
          <p className="search-hint">Enter 키 또는 버튼으로 검색 · 국립중앙도서관 Open API 연동</p>
        </section>

        {loading && (
          <div className="loading-wrap">
            <div className="loading-spinner" />
            <p className="loading-text">국립중앙도서관에서 자료를 불러오는 중…</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-box">
            <div className="error-icon">⚠</div>
            <p className="error-msg">{error}</p>
          </div>
        )}

        {!loading && !error && searched && books.length === 0 && (
          <div className="empty-box">
            <div className="empty-icon">📭</div>
            <p className="empty-text">검색 결과가 없습니다.<br />다른 키워드로 시도해보세요.</p>
          </div>
        )}

        {!loading && !error && books.length > 0 && (
          <>
            <div className="status-bar">
              <span className="status-count">총 {total?.toLocaleString()}건 중 {books.length}건 표시</span>
              <div className="status-line" />
            </div>
            <div className="books-grid">
              {books.map(function(book, i) {
                return <BookCard key={book.controlNo || i} book={book} index={i} />;
              })}
            </div>
          </>
        )}

        {!searched && !loading && (
          <div className="hero">
            <div className="hero-deco">書</div>
            <p className="hero-text">국립중앙도서관이 소장한 수백만 권의 자료를<br />키워드로 검색해보세요.</p>
          </div>
        )}
      </div>
    </>
  );
}