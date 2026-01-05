import './Footer.css'

// note: chỉnh màu chữ todo list #11
function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} My Website. All rights reserved.</p>
    </footer>
  )
}

export default Footer
