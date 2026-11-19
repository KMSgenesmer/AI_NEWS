// 다크/라이트 모드 설정. 선택값은 localStorage에 저장하고, 저장값이 없으면 OS 설정을 따른다.
export const THEME_STORAGE_KEY = "theme";

// 첫 화면이 그려지기 전에 <html>에 dark 클래스를 붙여 깜빡임(FOUC)을 막는 인라인 스크립트.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;
