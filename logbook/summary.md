# CPWeather — 10-Day Development Summary

**Intern:** CS Degree Student | **Project:** CPWeather (CuacaPerak)

---

**Day 1 — Project Setup**  
Set up the project from scratch using React and TypeScript. Installed all the tools the website needs (styling, charts, animations, testing). Made sure everything compiles and passes checks before writing any real code.

**Day 2 — Data Structure Design**  
Planned how all weather data will be organized — what fields exist, what they're called, what values are allowed. Built a system that checks incoming data is valid before the website displays it. Mapped out all 10 Perak locations with their coordinates.

**Day 3 — Connecting to Weather APIs**  
Wrote the code that pulls weather data from 5 different sources at once (OpenWeather and Malaysian government). Taught the system how to understand each source's format and combine everything into one clean result. Built the logic that decides whether it's safe to hike (Go/Caution/Skip).

**Day 4 — Saving Data for Faster Loading**  
Made the website save weather data locally so returning visitors see results instantly instead of waiting. Set a 15-minute expiry so data stays reasonably fresh. Built the system that quietly fetches new data in the background.

**Day 5 — Building the Page Layout**  
Created the main page structure with the header bar (logo, location picker, language switch, clock, refresh button). Designed the glass-like visual style that all panels use — translucent with soft shadows and blurred backgrounds.

**Day 6 — Main Weather Display**  
Built the hero section showing current temperature with an animated thermometer graphic, the hiking safety card (verdict, reasons, color-coded tags), and three info boxes (air quality, when rain is expected, active warnings).

**Day 7 — 5-Day Forecast & Chart**  
Built the 5-day forecast sidebar with rain probability bars. Created a temperature + rainfall chart that highlights the day you're hovering over. Made hovering on the chart also highlight the matching sidebar card, and vice versa.

**Day 8 — Warnings Panel & Dual Language**  
Built the warnings section that changes color based on severity (red for Alert, yellow for Watch, green for Monitor). Created the full dual-language system — every label, button, and message works in both English and Bahasa Malaysia. Added animated background effects.

**Day 9 — Visual Polish & Mobile Support**  
Finished the glass-effect styling across all panels. Added subtle animations (floating elements, hover effects). Made the layout adapt properly to tablets and phones. Ensured all animations turn off for users who prefer reduced motion.

**Day 10 — Testing & Deployment**  
Wrote automated tests that simulate real weather data to verify the hiking safety logic works correctly. Set up the website to run on Cloudflare's global network. Wrote the project documentation and prepared it for handover.
