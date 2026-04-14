# To-Do List Application

A premium, highly interactive Task Management dashboard built purely with vanilla HTML, CSS, and JavaScript. Inspired by modern productivity tools like Notion and Trello, this app features a beautiful 3-column layout, seamless drag-and-drop operations, and a completely private local authentication engine.

## 🚀 Live Demo
<!-- Replace '#' with your GitHub Pages URL once deployed! -->
[View the Live Demo Here](https://todo-list-amber-chi-17.vercel.app/)

---

## ✨ Key Features
- **Local Authentication**: A full mocked signup/login portal that stores unique sets of tasks for different local accounts.
- **Custom User Profiles**: Upload avatars via `FileReader` compressed locally onto a `<canvas>` element and converted to Base64 to safely live inside `localStorage` limits. Includes custom Display Names and Bios.
- **Advanced Task Logic**:
  - Assign specific dates, times, priorities (High/Med/Low), and categories to tasks.
  - Pinned tasks automatically lock to the top.
  - Overdue tasks instantly alert you with red highlights.
- **Smooth Drag and Drop**: Reorder your list intuitively via the HTML5 Drag and Drop API.
- **Browser Notifications**: Heartbeat background workers connect to the Notification API to ping your desktop when tasks hit a 15-minute approaching window.
- **Dynamic Calendar**: A custom-engineered grid calendar tracking your active task days.
- **Premium UI**: Uses CSS Variables for dynamic Dark/Light node switching, glassmorphism UI surfaces, Boxicons, and the Inter font family.

## 🛠️ Tech Stack
- **HTML5** & **Semantic Structuring**
- **Vanilla CSS3** (Flexbox/Grid, Variables, Animations)
- **Vanilla JavaScript** (ES6+, DOM Manipulation, LocalStorage)

## 🖥️ Getting Started

To test it locally on your machine without a web server:
1. Clone this repository to your desktop.
2. Open `index.html` inside any modern browser (Chrome, Edge, Firefox).
3. "Sign Up" securely using a dummy username/password combination.
4. Enjoy!

---
*Developed autonomously via AI-assisted Pair Programming.*
