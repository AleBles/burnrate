import Foundation
import Testing
@testable import CodeBurnMenubar

@Suite("Menubar refresh script")
struct MenubarRefreshScriptTests {
    @Test("scriptEnvironment exposes a safe argv and augmented PATH")
    func scriptEnvironmentIsSafe() {
        let env = CodeburnCLI.scriptEnvironment()
        #expect(!env.argv.isEmpty)
        #expect(env.argv.allSatisfy { CodeburnCLI.isSafe($0) })
        // Homebrew + /usr/local are always appended for GUI-launched apps.
        #expect(env.path.contains("/opt/homebrew/bin"))
        #expect(env.path.contains("/usr/local/bin"))
    }

    private func tempDir() -> String {
        let dir = NSTemporaryDirectory() + "menubar-script-test-" + UUID().uuidString
        try? FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
        return dir
    }

    @Test("generated script targets the status file and the requested period")
    func scriptContainsExpectedArgv() throws {
        let dir = tempDir()
        let statusPath = dir + "/menubar-status.json"
        let scriptPath = dir + "/menubar-refresh.sh"
        let cache = MenubarStatusCache(statusPath: statusPath, scriptPath: scriptPath)

        try cache.writeRefreshScript(period: .sevenDays)

        let body = try String(contentsOfFile: scriptPath, encoding: .utf8)
        #expect(body.contains("status --format menubar-json --provider all --period week --no-optimize"))
        #expect(body.contains(statusPath))
        #expect(body.contains("mv -f"))
        let perms = try FileManager.default.attributesOfItem(atPath: scriptPath)[.posixPermissions] as? NSNumber
        #expect(perms?.int16Value == 0o700)
    }

    @Test("running a generated-style script produces a readable status file")
    func scriptRoundTripsThroughStatusFile() throws {
        let dir = tempDir()
        let statusPath = dir + "/menubar-status.json"
        let tmpPath = statusPath + ".tmp"
        let scriptPath = dir + "/menubar-refresh.sh"

        let stubPath = dir + "/codeburn"
        let minimalJSON = #"""
        {"generated":"2026-05-29T00:00:00Z","current":{"label":"Today","cost":3.21,"calls":1,"sessions":1,"inputTokens":1,"outputTokens":1},"optimize":{"findingCount":0,"savingsUSD":0,"topFindings":[]},"history":{"daily":[]}}
        """#
        let stub = """
        #!/bin/sh
        cat <<'JSON'
        \(minimalJSON)
        JSON
        """
        try stub.write(toFile: stubPath, atomically: true, encoding: .utf8)
        try FileManager.default.setAttributes([.posixPermissions: NSNumber(value: 0o755)], ofItemAtPath: stubPath)

        let scriptBody = """
        #!/bin/sh
        TMP="\(tmpPath)"
        OUT="\(statusPath)"
        "\(stubPath)" status --format menubar-json --provider all --period today --no-optimize > "$TMP" 2>/dev/null && mv -f "$TMP" "$OUT" || rm -f "$TMP"
        """
        try scriptBody.write(toFile: scriptPath, atomically: true, encoding: .utf8)
        try FileManager.default.setAttributes([.posixPermissions: NSNumber(value: 0o700)], ofItemAtPath: scriptPath)

        let proc = Process()
        proc.executableURL = URL(fileURLWithPath: "/bin/sh")
        proc.arguments = [scriptPath]
        try proc.run()
        proc.waitUntilExit()
        #expect(proc.terminationStatus == 0)

        let cache = MenubarStatusCache(statusPath: statusPath, scriptPath: scriptPath)
        let result = cache.readBadgePayload(maxAgeSeconds: 3600)
        #expect(result?.payload.current.cost == 3.21)
    }
}
