from mcp.server import Server
from mcp.types import Tool, TextContent
from .tools import banking_tools
import asyncio

# Initialize MCP Server
server = Server("weezy-ai-bank-mcp")

@server.list_tools()
async def handle_list_tools() -> list[Tool]:
    """List available banking tools for AI agents."""
    return [
        Tool(
            name="check_balance",
            description="Get the current balance and status of a Nigerian bank account.",
            input_schema={
                "type": "object",
                "properties": {
                    "account_number": {"type": "string", "description": "10-digit NUBAN number"}
                },
                "required": ["account_number"]
            }
        ),
        Tool(
            name="transfer_funds",
            description="Transfer money between accounts (Internal or Inter-bank).",
            input_schema={
                "type": "object",
                "properties": {
                    "sender_account": {"type": "string"},
                    "receiver_account": {"type": "string"},
                    "amount": {"type": "number"},
                    "bank_code": {"type": "string", "description": "3-digit bank code, default 999"},
                    "narration": {"type": "string"}
                },
                "required": ["sender_account", "receiver_account", "amount"]
            }
        ),
        Tool(
            name="verify_account",
            description="Verify a bank account name before transfer.",
            input_schema={
                "type": "object",
                "properties": {
                    "bank_code": {"type": "string"},
                    "account_number": {"type": "string"}
                },
                "required": ["bank_code", "account_number"]
            }
        )
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Execute a banking tool based on AI request."""
    try:
        if name == "check_balance":
            result = banking_tools.get_account_balance(arguments["account_number"])
        elif name == "transfer_funds":
            result = await banking_tools.perform_transfer(**arguments)
        elif name == "verify_account":
            result = await banking_tools.verify_beneficiary(**arguments)
        else:
            raise ValueError(f"Unknown tool: {name}")

        import json
        return [TextContent(type="text", text=json.dumps(result, indent=2))]
    except Exception as e:
        return [TextContent(type="text", text=f"Error: {str(e)}")]

# Entry point for running as a standalone MCP server (stdio transport)
if __name__ == "__main__":
    from mcp.server.stdio import stdio_server
    async def main():
        async with stdio_server() as (read_stream, write_server):
            await server.run(read_stream, write_server, server.create_initialization_options())
    asyncio.run(main())
