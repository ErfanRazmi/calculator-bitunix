const fs = require('fs');
let content = fs.readFileSync('src/FuturesCalculator.jsx', 'utf8');

// Imports
content = content.replace(/Terminal\\n} from 'lucide-react';/, "Terminal, Sun, Moon\\n} from 'lucide-react';");

// ResultDetails
content = content.replace(/bg-white p-8/g, 'bg-white dark:bg-gray-900 p-8');
content = content.replace(/border-gray-100/g, 'border-gray-100 dark:border-gray-800');
content = content.replace(/border-gray-50/g, 'border-gray-50 dark:border-gray-800');
content = content.replace(/text-gray-900/g, 'text-gray-900 dark:text-white');
content = content.replace(/bg-gray-50/g, 'bg-gray-50 dark:bg-gray-800/50');
content = content.replace(/text-gray-800/g, 'text-gray-800 dark:text-gray-200');
content = content.replace(/hover:bg-\\[#B9F641\\]\\/10/g, 'hover:bg-[#B9F641]/10 dark:hover:bg-[#B9F641]/20');
content = content.replace(/text-gray-700/g, 'text-gray-700 dark:text-gray-300');
content = content.replace(/bg-white border-r/g, 'bg-white dark:bg-gray-900 border-r');

// InputField
content = content.replace(/border-gray-200/g, 'border-gray-200 dark:border-gray-700');
content = content.replace(/focus:bg-white/g, 'focus:bg-white dark:focus:bg-gray-900');
content = content.replace(/text-gray-600/g, 'text-gray-600 dark:text-gray-400');
content = content.replace(/text-gray-500/g, 'text-gray-500 dark:text-gray-400');

// State and Theme Wrapper
content = content.replace(/const \\[activeTab, setActiveTab\\] = useState\\('fees'\\);/, "const [activeTab, setActiveTab] = useState('fees');\\n  const [isDarkMode, setIsDarkMode] = useState(true);");
content = content.replace(/<div className=\"flex flex-col md:flex-row min-h-screen bg-\\[#F8FAFC\\] font-sans text-gray-800\">/, "<div className={isDarkMode ? 'dark' : ''}>\\n    <div className=\\"flex flex-col md:flex-row min-h-screen bg-[#F8FAFC] dark:bg-gray-950 font-sans text-gray-800 dark:text-gray-200\\">");
content = content.replace(/<\\/div>\\n  \\);\\n}/, "</div>\\n    </div>\\n  );\\n}");

// Sidebar Toggle Button
const toggleHtml = `        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 mt-auto"
        >
          <span className="flex items-center gap-3.5">
            {isDarkMode ? <Sun size={20} className="text-gray-400" /> : <Moon size={20} className="text-gray-400" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
      </div>`;

content = content.replace(/<\\/nav>\\n      <\\/div>/, "</nav>\\n" + toggleHtml);

// PnL Cards
content = content.replace(/bg-gray-900 p-8 rounded-3xl/g, 'bg-gray-900 dark:bg-black p-8 rounded-3xl');
content = content.replace(/text-white/g, 'text-white dark:text-gray-100');
content = content.replace(/border-\\[#a3da39\\]/g, 'border-[#a3da39] dark:border-[#B9F641]');

// Table
content = content.replace(/divide-gray-100/g, 'divide-gray-100 dark:divide-gray-800');
content = content.replace(/hover:bg-gray-50/g, 'hover:bg-gray-50 dark:hover:bg-gray-800/50');
content = content.replace(/bg-gray-100 p-2.5/g, 'bg-gray-100 dark:bg-gray-800 p-2.5');
content = content.replace(/bg-white rounded-3xl/g, 'bg-white dark:bg-gray-900 rounded-3xl');

// Inputs/Selects specific
content = content.replace(/bg-white border/g, 'bg-white dark:bg-gray-800 border');

fs.writeFileSync('src/FuturesCalculator.jsx', content);
console.log("Done");
