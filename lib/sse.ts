export class SSEManager {
  private clients: Map<string, WritableStreamDefaultWriter<Uint8Array>[]> = new Map();

  addClient(streamId: string, writer: WritableStreamDefaultWriter<Uint8Array>) {
    if (!this.clients.has(streamId)) this.clients.set(streamId, []);
    this.clients.get(streamId)!.push(writer);
  }

  removeClient(streamId: string, writer: WritableStreamDefaultWriter<Uint8Array>) {
    const writers = this.clients.get(streamId);
    if (!writers) return;

    const index = writers.indexOf(writer);
    if (index !== -1) writers.splice(index, 1);

    if (writers.length === 0) this.clients.delete(streamId);
  }

  async broadcast(streamId: string, data: any) {
    const writers = this.clients.get(streamId);
    if (!writers) return;

    const encoder = new TextEncoder();
    const message = `data: ${JSON.stringify(data)}\n\n`;

    for (const writer of writers.slice()) {
      try {
        await writer.write(encoder.encode(message));
      } catch (err) {
        console.error("SSE writer failed, removing client:", err);
        this.removeClient(streamId, writer);
      }
    }
  }

  getClientCount(streamId: string) {
    return this.clients.get(streamId)?.length || 0;
  }
}

export const sseManager = new SSEManager();
