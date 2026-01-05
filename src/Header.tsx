import './Header.css'

// note: đổi tên biến cho rõ nghĩa #18
function Header() {
  return (
    <header className="header">
      <a className="logo" href="/">
        My Website
      </a>
      <nav>
        <a href="#home">Trang chủ</a>
        <a href="#about">Giới thiệu</a>
        <a href="#contact">Liên hệ</a>
      </nav>
    </header>
  )
}

export default Header
