import { useState, useEffect, useRef } from 'react';
import skillList from '../lib/skillList';

const uniqueSkills = Array.from(new Set(skillList)).sort();

export default function SkillSelector({ selected = [], onChange = () => {} }) {
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState(uniqueSkills);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    setFiltered(
      uniqueSkills.filter((skill) =>
        skill.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query]);

  const toggleSkill = (skill) => {
    const updated = selected.includes(skill)
      ? selected.filter((s) => s !== skill)
      : [...selected, skill];
    onChange(updated);
    setQuery('');
    inputRef.current.focus();
  };

  const removeSkill = (skill) => {
    onChange(selected.filter((s) => s !== skill));
  };

  return (
    <div className="w-full max-w-xl relative">
      <label className="block mb-1 text-sm font-medium">🔧 Choose Skills</label>

      <input
        ref={inputRef}
        type="text"
        placeholder="Search and select..."
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setDropdownVisible(true);
        }}
        onFocus={() => setDropdownVisible(true)}
        onBlur={() => setTimeout(() => setDropdownVisible(false), 100)}
      />

      {dropdownVisible && filtered.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md max-h-48 overflow-auto shadow-lg">
          {filtered.map((skill) => (
            <li
              key={skill}
              onClick={() => toggleSkill(skill)}
              className={`cursor-pointer px-4 py-2 hover:bg-purple-100 ${
                selected.includes(skill)
                  ? 'bg-purple-200 text-purple-800 font-semibold'
                  : ''
              }`}
            >
              {skill}
            </li>
          ))}
        </ul>
      )}

      {selected.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2">✅ Selected Skills:</h3>
          <div className="flex flex-wrap gap-2">
            {selected.map((skill) => (
              <div
                key={skill}
                className="flex items-center gap-1 bg-purple-100 text-purple-800 border border-purple-300 rounded-full px-3 py-1 text-sm font-medium shadow-sm"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-1 text-purple-500 hover:text-red-500 focus:outline-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
