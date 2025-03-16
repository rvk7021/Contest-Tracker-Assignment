import React from 'react';

export default function Problem({ problem }) {
  return (
    <article className="max-w-4xl mx-auto p-6 bg-slate-900 rounded-lg shadow-xl border border-indigo-900">
      <header>
        <h2 className="text-2xl font-bold text-indigo-300 border-b border-indigo-800 pb-2">{problem.title}</h2>
        <p className="mt-4 text-slate-300 text-lg">{problem.description}</p>
      </header>

      <section className="space-y-6 mt-6">
        <div className="bg-slate-800 p-4 rounded-md border border-slate-700">
          <h3 className="font-semibold text-indigo-200 mb-2">Input Format</h3>
          <p className="text-slate-300">{problem.inputFormat}</p>
        </div>

        <div className="bg-slate-800 p-4 rounded-md border border-slate-700">
          <h3 className="font-semibold text-indigo-200 mb-2">Output Format</h3>
          <p className="text-slate-300">{problem.outputFormat}</p>
        </div>

        <div className="bg-slate-800 p-4 rounded-md border border-slate-700">
          <h3 className="font-semibold text-indigo-200 mb-2">Constraints</h3>
          <p className="text-slate-300">{problem.constraints}</p>
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-xl font-semibold text-indigo-200 mb-4">Examples</h3>
        {problem.examples && problem.examples.length > 0 ? (
          <div className="space-y-4">
            {problem.examples.map((example, index) => (
              <div 
                key={index} 
                className="border border-indigo-800 rounded-lg overflow-hidden"
              >
                <div className="bg-indigo-900 p-3 border-b border-indigo-800">
                  <h4 className="font-medium text-indigo-300">Example {index + 1}</h4>
                </div>
                <div className="p-4 space-y-3 bg-slate-800">
                  <div>
                    <h5 className="font-medium text-indigo-200 mb-1">Input:</h5>
                    <pre className="bg-slate-950 p-3 rounded font-mono text-sm overflow-x-auto text-slate-300 border border-slate-700">{example.input}</pre>
                  </div>
                  <div>
                    <h5 className="font-medium text-indigo-200 mb-1">Output:</h5>
                    <pre className="bg-slate-950 p-3 rounded font-mono text-sm overflow-x-auto text-slate-300 border border-slate-700">{example.output}</pre>
                  </div>
                  {example.explanation && (
                    <div>
                      <h5 className="font-medium text-indigo-200 mb-1">Explanation:</h5>
                      <p className="text-slate-300">{example.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 italic">No examples provided.</p>
        )}
      </section>
    </article>
  );
}