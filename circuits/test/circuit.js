const { expect, assert } = require("chai");

describe("hello world test", function () {

    it("Should test", async () => {
        const x = 1;
        const y = 2;
        const z = x + y;

        assert.equal(z, 3);
    });


});