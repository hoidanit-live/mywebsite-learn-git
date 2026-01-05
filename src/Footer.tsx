import './Footer.css'

// note: chỉnh nhỏ giao diện header #27
function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} My Website. All rights reserved.</p>
    </footer>
  )
}

export default Footer
