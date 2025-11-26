import React from 'react';
import { SimpleTabs, TabPanel } from './Tabs';
import { BuildingIcon, FolderIcon, UsersIcon, DocumentsIcon, ClipboardListIcon } from './icons';

/**
 * TABS TEST COMPONENT
 * 
 * This is a simple example to test your new Tabs component!
 * You can add this to your App.tsx temporarily to see it in action.
 * 
 * HOW TO TEST:
 * 1. In src/App.tsx, add this import at the top:
 *    import { TabsExample } from '../components/TabsExample';
 * 
 * 2. Add <TabsExample /> somewhere in your render to see it
 * 
 * 3. Once you've tested it, you can remove it and start using
 *    tabs in your actual components!
 */

export const TabsExample: React.FC = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Tabs Component Demo 📑</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Try clicking the tabs below and see the smooth animations!
      </p>

      {/* Example 1: Default Tabs with Icons */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Example 1: Default Style (with sliding indicator)</h2>
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md p-6 rounded-xl shadow-lg">
          <SimpleTabs variant="default" size="md">
            <TabPanel 
              label="Overview" 
              icon={<BuildingIcon />}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-cyan-50 dark:bg-cyan-900/30 p-6 rounded-xl">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Total Projects</h3>
                    <p className="text-3xl font-bold text-cyan-600">24</p>
                  </div>
                  <div className="bg-cyan-50 dark:bg-cyan-900/30 p-6 rounded-xl">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Team Members</h3>
                    <p className="text-3xl font-bold text-cyan-600">12</p>
                  </div>
                  <div className="bg-cyan-50 dark:bg-cyan-900/30 p-6 rounded-xl">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Documents</h3>
                    <p className="text-3xl font-bold text-cyan-600">89</p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  This is the overview tab content. Notice how smooth the transition is when you switch tabs!
                </p>
              </div>
            </TabPanel>

            <TabPanel 
              label="Projects" 
              icon={<FolderIcon />}
              badge={5}
            >
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Project {i}</h4>
                        <p className="text-sm text-slate-500">Status: Active</p>
                      </div>
                      <div className="w-24 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-cyan-500 h-2 rounded-full" 
                          style={{ width: `${Math.random() * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabPanel>

            <TabPanel 
              label="Team" 
              icon={<UsersIcon />}
              badge={12}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl text-center hover:scale-105 transition-transform">
                    <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                    <h4 className="font-semibold text-sm">Team Member {i}</h4>
                    <p className="text-xs text-slate-500">Role</p>
                  </div>
                ))}
              </div>
            </TabPanel>

            <TabPanel 
              label="Documents" 
              icon={<DocumentsIcon />}
              badge="12"
            >
              <div className="space-y-2">
                {['Proposal.pdf', 'Contract.docx', 'Report.xlsx', 'Presentation.pptx'].map((file, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <DocumentsIcon />
                      <span>{file}</span>
                    </div>
                    <button className="px-3 py-1 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </TabPanel>
          </SimpleTabs>
        </div>
      </div>

      {/* Example 2: Pills Style */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Example 2: Pills Style (rounded buttons)</h2>
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md p-6 rounded-xl shadow-lg">
          <SimpleTabs variant="pills" size="md">
            <TabPanel label="Dashboard">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-8 rounded-xl text-center">
                <h3 className="text-2xl font-bold mb-2">Welcome to your Dashboard! 📊</h3>
                <p className="text-slate-600 dark:text-slate-400">Pills style tabs are great for settings pages and simpler UIs.</p>
              </div>
            </TabPanel>

            <TabPanel label="Analytics">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-xl text-center">
                <h3 className="text-2xl font-bold mb-2">Analytics Coming Soon 📈</h3>
                <p className="text-slate-600 dark:text-slate-400">This is where your charts and graphs will go!</p>
              </div>
            </TabPanel>

            <TabPanel label="Settings">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-8 rounded-xl text-center">
                <h3 className="text-2xl font-bold mb-2">Settings ⚙️</h3>
                <p className="text-slate-600 dark:text-slate-400">Configure your preferences here!</p>
              </div>
            </TabPanel>
          </SimpleTabs>
        </div>
      </div>

      {/* Example 3: Underline Style */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Example 3: Underline Style (minimal)</h2>
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md p-6 rounded-xl shadow-lg">
          <SimpleTabs variant="underline" size="lg">
            <TabPanel label="Personal Info">
              <div className="space-y-4 pt-4">
                <div>
                  <label className="block font-medium mb-2">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </TabPanel>

            <TabPanel label="Notifications" badge="2">
              <div className="space-y-4 pt-4">
                <label className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer">
                  <input type="checkbox" className="w-5 h-5" defaultChecked />
                  <span>Email notifications</span>
                </label>
                <label className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer">
                  <input type="checkbox" className="w-5 h-5" defaultChecked />
                  <span>Push notifications</span>
                </label>
                <label className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer">
                  <input type="checkbox" className="w-5 h-5" />
                  <span>Weekly digest</span>
                </label>
              </div>
            </TabPanel>

            <TabPanel label="Privacy">
              <div className="space-y-4 pt-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">🔒 Your Privacy Matters</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    We take your privacy seriously. Your data is encrypted and never shared with third parties.
                  </p>
                </div>
              </div>
            </TabPanel>
          </SimpleTabs>
        </div>
      </div>

      {/* Keyboard Navigation Hint */}
      <div className="bg-cyan-50 dark:bg-cyan-900/30 p-6 rounded-xl">
        <h3 className="font-semibold mb-2">💡 Pro Tip: Try Keyboard Navigation!</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Click on any tab, then use your arrow keys (← →) to navigate between tabs. You can also press Home/End to jump to the first/last tab!
        </p>
      </div>
    </div>
  );
};
