const scripts = {
  МТУСИ: "./mtuci",
};

const runForChosenUniversity = async () => {
  const universityName = process.env.npm_config_university;
  const start = process.env.npm_config_start;
  const end = process.env.npm_config_end;

  if (universityName) {
    const script = scripts[universityName];

    if (script) {
      await require(script).run(parseInt(start), parseInt(end));
    } else {
      console.log("There is no university with that name");
    }
  } else {
    console.log('University variable not defined. Try add --university="..."');
  }

  console.log("end");
  process.exit();
};

runForChosenUniversity();
