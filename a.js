const a = () => {
  for (let index = 0; index < 10; index++) {
    console.log(index);
    if(index === 5) {
      return;
    }
  }
}

a()