import React from 'react';
import { SimpleAccordion, AccordionSection } from './Accordion';
import { 
  BuildingIcon, 
  UsersIcon, 
  DocumentsIcon, 
  CalendarIcon,
  ClipboardListIcon,
  SparklesIcon,
  QuestionMarkCircleIcon
} from './icons';

/**
 * ACCORDION TEST COMPONENT
 * 
 * This shows off all the features of your new Accordion component!
 * 
 * HOW TO TEST:
 * 1. In src/App.tsx, add this import at the top:
 *    import { AccordionExample } from '../components/AccordionExample';
 * 
 * 2. Add <AccordionExample /> somewhere in your render
 * 
 * 3. Check it out in your browser!
 */

export const AccordionExample: React.FC = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">Accordion Component Demo 📋</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Click sections to expand and collapse them. Try all the different styles!
        </p>
      </div>

      {/* Example 1: Default Style - Client Form */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Example 1: Client Information Form (Default Style)</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Perfect for breaking up long forms into manageable sections
        </p>
        
        <SimpleAccordion mode="multiple" variant="default" size="md">
          <AccordionSection 
            title="Basic Information" 
            icon={<BuildingIcon />}
            defaultExpanded
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Organization Name</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  placeholder="Acme Corporation"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800">
                    <option>Non-Profit</option>
                    <option>For-Profit</option>
                    <option>Government</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Industry</label>
                  <select className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800">
                    <option>Healthcare</option>
                    <option>Education</option>
                    <option>Technology</option>
                  </select>
                </div>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection 
            title="Contact Details" 
            icon={<UsersIcon />}
            badge={3}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                    placeholder="contact@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input 
                    type="tel" 
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <textarea 
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  rows={3}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>
            </div>
          </AccordionSection>

          <AccordionSection 
            title="Additional Information" 
            icon={<DocumentsIcon />}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea 
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  rows={4}
                  placeholder="Any additional notes about this organization..."
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm">Add to priority clients</span>
                </label>
              </div>
            </div>
          </AccordionSection>
        </SimpleAccordion>
      </div>

      {/* Example 2: Bordered Style - Project Sections */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Example 2: Project Overview (Bordered Style)</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Bordered style works great for compact lists
        </p>

        <SimpleAccordion mode="single" variant="bordered" size="md">
          <AccordionSection 
            title="Project Timeline" 
            icon={<CalendarIcon />}
            badge={12}
            defaultExpanded
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                <div>
                  <p className="font-semibold">Phase 1: Planning</p>
                  <p className="text-sm text-slate-500">Jan 1 - Jan 31</p>
                </div>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">
                  Completed
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                <div>
                  <p className="font-semibold">Phase 2: Development</p>
                  <p className="text-sm text-slate-500">Feb 1 - Mar 31</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                  In Progress
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                <div>
                  <p className="font-semibold">Phase 3: Launch</p>
                  <p className="text-sm text-slate-500">Apr 1 - Apr 30</p>
                </div>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300 rounded-full text-sm">
                  Upcoming
                </span>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection 
            title="Team Members" 
            icon={<UsersIcon />}
            badge={8}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <p className="text-sm font-semibold">Member {i}</p>
                  <p className="text-xs text-slate-500">Role</p>
                </div>
              ))}
            </div>
          </AccordionSection>

          <AccordionSection 
            title="Tasks & Milestones" 
            icon={<ClipboardListIcon />}
            badge="15"
          >
            <div className="space-y-2">
              {['Setup repository', 'Design mockups', 'Backend API', 'Frontend components', 'Testing'].map((task, i) => (
                <label key={i} className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-slate-800 rounded transition-colors">
                  <input type="checkbox" className="w-4 h-4" defaultChecked={i < 2} />
                  <span className={i < 2 ? 'line-through text-slate-500' : ''}>{task}</span>
                </label>
              ))}
            </div>
          </AccordionSection>

          <AccordionSection 
            title="Documents & Files" 
            icon={<DocumentsIcon />}
            badge={24}
          >
            <div className="space-y-2">
              {['Project Brief.pdf', 'Design Spec.docx', 'Budget.xlsx', 'Contract.pdf'].map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <span className="text-sm">{file}</span>
                  <button className="text-cyan-600 hover:text-cyan-700 text-sm">Download</button>
                </div>
              ))}
            </div>
          </AccordionSection>
        </SimpleAccordion>
      </div>

      {/* Example 3: Separated Style - FAQ */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Example 3: FAQ Section (Separated Style)</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Separated style gives each section breathing room
        </p>

        <SimpleAccordion mode="multiple" variant="separated" size="md">
          <AccordionSection 
            title="How do I add a new client?" 
            icon={<QuestionMarkCircleIcon />}
          >
            <div className="prose dark:prose-invert max-w-none">
              <p>To add a new client to Logos Vision:</p>
              <ol className="list-decimal list-inside space-y-2 mt-2">
                <li>Navigate to the Organizations page</li>
                <li>Click the "Add Organization" button</li>
                <li>Fill in the required information</li>
                <li>Click "Save" to create the client</li>
              </ol>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                You can also use the quick add button (+ icon) in the header for faster access!
              </p>
            </div>
          </AccordionSection>

          <AccordionSection 
            title="Can I import data from Excel?" 
            icon={<QuestionMarkCircleIcon />}
          >
            <div className="prose dark:prose-invert max-w-none">
              <p>Yes! Logos Vision supports importing data from Excel files (.xlsx, .csv).</p>
              <p className="mt-2">Supported import types:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Client/Organization data</li>
                <li>Project information</li>
                <li>Volunteer lists</li>
                <li>Donation records</li>
              </ul>
            </div>
          </AccordionSection>

          <AccordionSection 
            title="How do I assign team members to projects?" 
            icon={<QuestionMarkCircleIcon />}
          >
            <div className="prose dark:prose-invert max-w-none">
              <p>There are two ways to assign team members:</p>
              <div className="mt-3 space-y-3">
                <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg">
                  <p className="font-semibold">Method 1: From Project View</p>
                  <p className="text-sm mt-1">Open the project, go to the Team tab, and click "Add Team Member"</p>
                </div>
                <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg">
                  <p className="font-semibold">Method 2: From Team Member Profile</p>
                  <p className="text-sm mt-1">Open a team member's profile and assign them to projects from there</p>
                </div>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection 
            title="What's included in the reports?" 
            icon={<QuestionMarkCircleIcon />}
            badge="New"
          >
            <div className="prose dark:prose-invert max-w-none">
              <p>Logos Vision offers comprehensive reporting including:</p>
              <ul className="grid grid-cols-2 gap-2 mt-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Project progress</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Donation analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Volunteer hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Client engagement</span>
                </li>
              </ul>
            </div>
          </AccordionSection>
        </SimpleAccordion>
      </div>

      {/* Features showcase */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-6 rounded-xl">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <SparklesIcon />
          Features You Just Saw
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>Smooth expand/collapse animations</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>Multiple expansion modes (single/multiple)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>Three style variants</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>Icons and badges support</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>Dark mode compatible</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>Keyboard navigation (Space/Enter)</span>
          </li>
        </ul>
      </div>

      {/* Keyboard hint */}
      <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl">
        <h3 className="font-semibold mb-2">💡 Keyboard Navigation</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Click on any accordion header, then press <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs">Space</kbd> or <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs">Enter</kbd> to toggle it!
        </p>
      </div>
    </div>
  );
};
