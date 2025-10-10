router.post('/submit', authenticate, async (req, res) => {
  const { questionId, code, language } = req.body;
  const userId = req.user.id;
  const question = await CodingQuestion.findById(questionId);
  const testCase = question && question.testCases && question.testCases[0] ? question.testCases[0] : {};
  let output = "", passed = false, statusDesc = "", suggestions = [];

  try {
    const judgeRes = await runJudge0({
      source_code: code,
      language: language,
      stdin: testCase.input || "",
      expected_output: testCase.expectedOutput || ""
    });

    output = judgeRes.stdout || judgeRes.compile_output || judgeRes.stderr || '';
    statusDesc = judgeRes.status ? judgeRes.status.description : "";
    passed = judgeRes.status && judgeRes.status.description === "Accepted";

    // -------------------------------
    // Output normalization & custom compare
    // -------------------------------
    let expected = (testCase.expectedOutput || "").trim();
    let actual = (output || '').trim();

    // For Python-style booleans, allow flexible match
    if (
      typeof expected === "string" &&
      (expected === "True" || expected === "False" ||
       expected === "true" || expected === "false")
    ) {
      if (
        actual.toLowerCase() === expected.toLowerCase() || // 'true' vs 'True'
        actual.replace(/[\r\n]+/g, '') === expected.replace(/[\r\n]+/g, '') // Remove line breaks
      ) {
        passed = true;
        statusDesc = "Accepted";
      }
    }
    // Also check case-insensitive match for string outputs
    else if (
      typeof expected === "string" &&
      typeof actual === "string" &&
      expected.toLowerCase() === actual.toLowerCase()
    ) {
      passed = true;
      statusDesc = "Accepted";
    }

    // -------------------------------
    // Suggestions
    // -------------------------------
    if (!passed) {
      suggestions.push("Check your logic and output format.");
      if (judgeRes.stderr) suggestions.push("Your code has errors: " + judgeRes.stderr);
      if (judgeRes.compile_output) suggestions.push("Compiler says: " + judgeRes.compile_output);
      if (statusDesc) suggestions.push("Status: " + statusDesc);

      // Output format hints
      if (expected && actual && expected.toLowerCase() === actual.toLowerCase() && expected !== actual) {
        suggestions.push("Your answer is almost correct! Check output capitalization or whitespace.");
      }
      if (expected && actual && expected.replace(/[\r\n]+/g, '') === actual.replace(/[\r\n]+/g, '') && expected !== actual) {
        suggestions.push("Remove any extra newlines or spaces at the end of your output.");
      }
      if (language === 'python' && !code.includes('def')) suggestions.push('Use Python functions for clean code.');
      if (language === 'react' && !code.includes('useState')) suggestions.push('Try React hooks for state.');
      if (language === 'mysql' && !code.toLowerCase().includes('select')) suggestions.push('Use SELECT to retrieve data.');
    } else {
      suggestions.push("Great job! Your code passed.");
    }

    // Debug log for dev
    console.log(`[Grading] QID: ${questionId} | Expected: "${expected}" | Actual: "${actual}" | Status: ${statusDesc}`);

  } catch (err) {
    output = "Code judge error: " + err.message;
    suggestions.push("Server error, please try again.");
  }

  await CodingSubmission.create({
    userId,
    questionId,
    code,
    language,
    output,
    passed,
    suggestions
  });

  res.json({ output, passed, suggestions, status: statusDesc });
});
