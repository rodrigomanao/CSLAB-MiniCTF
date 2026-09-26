import SiteNav from '../components/SiteNav'

export default function AboutUsPage() {
  return (
    <div className="page about-page">
      <SiteNav showSearch={false} showLogo={false} />
      <main className="about-main">
        <section className="about-hero">
          <div className="about-logo-wrap">
            <img className="about-logo" src="/logos/cisuc.png" alt="CISUC Cybersecurity Transversal Laboratory" />
          </div>
          <div className="about-copy">
            <p>CyberSecurity Laboratory (CS-Lab) is a transversal laboratory of CISUC, promoting CyberSecurity research, activities, challenges like Capture The Flag (CTF), Ethical Hacking, and learning through academia partnerships.</p>
            <p>The CS-Lab brings together cybersecurity researchers, professors, and students who share a passion for security. It also participates in research and development activities, including international collaboration projects.</p>
            <p>The CS-Lab provides access to cybersecurity academies promoted by major security solution vendors, including Palo Alto, Fortinet, and Cisco.</p>
            <p>The CS-Lab was created through the First Foundation initiative in 2024, with funding to establish an initial infrastructure supporting its different activities.</p>
            <p>The CS-Lab is currently coordinated by Bruno Sousa and João R. Campos.</p>
          </div>
        </section>
      </main>
    </div>
  )
}
