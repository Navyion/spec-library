export default async function handler(request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key") || "";
  const kwd = url.searchParams.get("kwd") || "";
  const pageSize = url.searchParams.get("pageSize") || "10";
  const pageNum = url.searchParams.get("pageNum") || "1";

  const apiUrl =
    "https://www.nl.go.kr/NL/search/openApi/search.do" +
    "?key=" + key +
    "&apiType=xml" +
    "&srchTarget=total" +
    "&kwd=" + encodeURIComponent(kwd) +
    "&pageSize=" + pageSize +
    "&pageNum=" + pageNum;

  try {
    const response = await fetch(apiUrl);
    const data = await response.text();

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response("<error>API 서버 연결 실패</error>", {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}

export const config = {
  path: "/api/*",
};