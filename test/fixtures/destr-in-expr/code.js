import own from "../../../src/macro";

for ({ a } in own(getB())) {
  a;
}
