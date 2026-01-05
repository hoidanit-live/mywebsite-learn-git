import './Footer.css'

// note: thêm ghi chú TODO #31
function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} My Website. All rights reserved.</p>
    </footer>
  )
}

export default Footer
