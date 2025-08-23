// client/src/components/AboutUsPage.jsx
import React from "react";
import About from "./About";
import Timeline from "./Timeline";
import "./AboutUsPage.css";

function AboutUsPage() {
  return (
      <section className="content-section">
        <About />
        <Timeline />
      </section>
  );
}

export default AboutUsPage;
