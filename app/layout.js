
import "./globals.css";




export const metadata = {
  title: "Social Sanad",
  description: "A website for to learn how technology works in Politics",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
