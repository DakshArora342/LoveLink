
# Love-Link Welcome Page

A visually appealing, animated React welcome page for **Love-Link**, a private dating platform for students.  
Features a glowing iridescent background, floating hearts animation, and a fun randomized footer credit with clickable developer links.

---

## Demo

*(Add a screenshot or demo link here if available)*

---

## Features

- Iridescent animated background with customizable colors and animation speed.
- Floating hearts drifting upwards with randomized positions and timings.
- Glassmorphic content card with title, description, and "Get Started" button.
- Randomized footer credit phrases featuring Moksh (frontend) and Daksh (backend) with styled links.
- Responsive and mobile-friendly layout.
- Smooth animations using [Framer Motion](https://www.framer.com/motion/).
- Uses React Router’s `<Link>` for navigation.
- Modern, clean design with Tailwind CSS utility classes.

---

## Installation

1. Clone the repository or copy the project files:

   ```bash
   git clone https://github.com/yourusername/love-link.git
   cd love-link
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:

   ```bash
   npm start
   # or
   yarn start
   ```

---

## Usage

- The main component is `WelcomePage.jsx`.
- Requires the `Iridescence` component for the animated background.
- Use React Router to navigate and include `<WelcomePage />` where desired.

---

## Customize

- Update the `phrases` array in `WelcomePage.jsx` to change footer credits.
- Adjust `Iridescence` props (`color`, `speed`, `amplitude`) to tweak background.
- Modify the number of hearts by changing the `hearts` array length.
- Change button links or styles inside the component.

---

## Credits

- Frontend by **Moksh** [GitHub](https://github.com/moksh205)
- Backend by **Daksh** [GitHub](https://github.com/DakshArora342)

---

## License

This project is licensed under the MIT License.
