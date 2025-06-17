import asyncio
import websockets
import random
import time
from datetime import datetime

# 存储所有连接的客户端
connected = set()

# 命令处理函数映射
command_handlers = {}


def register_command(command):
    def decorator(func):
        command_handlers[command] = func
        return func

    return decorator


@register_command("time")
async def get_time(websocket):
    await websocket.send(f"当前时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


@register_command("random")
async def get_random(websocket):
    await websocket.send(f"随机数: {random.randint(1, 100)}")


@register_command("uptime")
async def get_uptime(websocket):
    await websocket.send(f"服务器已运行: {time.time() - start_time:.1f}秒")


@register_command("help")
async def get_help(websocket):
    help_text = """可用命令:
- time: 获取当前时间
- random: 生成随机数
- uptime: 查看服务器运行时间
- help: 显示帮助信息"""
    await websocket.send(help_text)


# 自动推送消息的函数
async def push_messages():
    while True:
        if connected:
            messages = [
                f"当前时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                f"随机数: {random.randint(1, 100)}",
                f"服务器已运行: {time.time() - start_time:.1f}秒"
            ]
            message = random.choice(messages)

            await asyncio.gather(
                *[client.send(f"推送消息: {message}") for client in connected]
            )
            print(f"已推送: {message}")

        await asyncio.sleep(5)


# 处理WebSocket连接
async def handler(websocket):
    connected.add(websocket)
    print(f"新客户端连接，当前连接数: {len(connected)}")

    try:
        # 发送欢迎消息和帮助信息
        await websocket.send("欢迎连接到WebSocket服务器！输入'help'获取可用命令列表。")

        # 同时处理接收消息和推送任务
        receive_task = asyncio.create_task(websocket.recv())
        push_task = asyncio.create_task(push_messages())

        while True:
            done, pending = await asyncio.wait(
                [receive_task, push_task],
                return_when=asyncio.FIRST_COMPLETED
            )

            for task in done:
                if task == receive_task:
                    try:
                        message = await task
                        command = message.strip().lower()

                        if command in command_handlers:
                            await command_handlers[command](websocket)
                        else:
                            await websocket.send("未知命令。输入'help'获取命令列表。")
                    except websockets.exceptions.ConnectionClosedOK:
                        break

                    # 重新创建接收任务
                    receive_task = asyncio.create_task(websocket.recv())
                elif task == push_task:
                    # 推送任务完成（不会发生，因为是无限循环）
                    pass
    finally:
        connected.remove(websocket)
        print(f"客户端断开，当前连接数: {len(connected)}")


# 主函数
async def main():
    global start_time
    start_time = time.time()

    async with websockets.serve(handler, "localhost", 8765):
        print("WebSocket服务器已启动，监听端口8765...")
        await asyncio.Future()  # 永远运行


if __name__ == "__main__":
    asyncio.run(main())