import { Search } from "lucide-react";
import Form from "next/form";
function SearchBar() {
  return (
    <div>
      <Form action="/search" className="relative">
        <input
          type="text"
          name="q"
          placeholder="search for events..."
          className="w-full py-2 px-4 pl-12 bg-white rounded-xl border border-yellow-300 shadow-md focus:outline-none focus-ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300 w-5 h-5" />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-yellow-300 text-pink-300 px-4 py-1 rounded-lg font-semibold hover:bg-yellow-200 transition-colors duration-200"
        >
          Search
        </button>
      </Form>
    </div>
  );
}

export default SearchBar;
