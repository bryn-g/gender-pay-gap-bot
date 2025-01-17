export async function wait(time = 3000): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });
}

export async function waitOneSecond() {
  await wait(1000);
}
