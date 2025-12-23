export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} SoleBuy | k3LSoft Devs. | All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
