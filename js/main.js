var Card = function (val, id) {

    this.statusOpen = 1;
    this.statusClose = 2;

    this.status = this.statusClose;
    this.value = val;
    this.id = id;

    this.isBothOpen = false;

    this.open = function () {
        this.status = this.statusOpen;
        $("[data-id='" + this.id + "']").attr('src', 'images/pic' + this.value + '.jpg');
    };

    this.close = function () {
        this.status = this.statusClose;
        $("[data-id='" + this.id + "']").attr('src', 'images/back.jpg');
    };

};

var Timer = function () {

    this.purposeInitial = 1;
    this.purposePlaying = 2;
    this.timeInitial = 15;
    this.timePlaying = 60;


    this.setPurpose = function (purpose) {
        this.purpose = purpose;
        this.restartTime();
    };

    this.restartTime = function () {
        if (this.purpose == this.purposeInitial) {
            this.time = this.timeInitial;
        } else {
            this.time = this.timePlaying;
        }
    };
    this.decreaseTime = function () {
        this.time--;
    };

};

var Board = function () {
    this.widthHeight = 4;
    this.table = [];

    this.openAll = function () {
        for (var i = 0; i < this.widthHeight; i++) {
            for (var j = 0; j < this.widthHeight; j++) {
                this.table[i][j].open();
            }
        }
    };

    this.closeAll = function () {
        for (var i = 0; i < this.widthHeight; i++) {
            for (var j = 0; j < this.widthHeight; j++) {
                this.table[i][j].close();
            }
        }
    };

    this.shuffle = function () {
        var i;
        var tempBoard = [];
        var count = Math.pow(this.widthHeight, 2) / 2;
        for (i = 0; i < count; i++) {
            tempBoard[i] = i + 1;
        }

        var secondArray = tempBoard.slice();
        tempBoard = tempBoard.concat(secondArray);

        for (i = 0; i < count; i++) {
            var ind1 = Math.round(Math.random() * (Math.pow(this.widthHeight, 2) - 1));
            var ind2 = Math.round(Math.random() * (Math.pow(this.widthHeight, 2) - 1));
            var tmp = tempBoard[ind1];
            tempBoard[ind1] = tempBoard[ind2];
            tempBoard[ind2] = tmp;
        }

        var card;
        for (i = 0; i < count * 2; i++) {
            var row = Math.floor(i / this.widthHeight);

            if (typeof this.table[row] == 'undefined') {
                this.table[row] = [];
            }
            var col = (i % this.widthHeight);
            card = new Card(tempBoard[i], i);
            this.table[row][col] = card;
        }

    };


};

var Game = function () {
    this.board = new Board();

    this.timerInitial = new Timer();
    this.timerPlaying = new Timer();

    this.timerInitial.setPurpose(this.timerInitial.purposeInitial);
    this.timerPlaying.setPurpose(this.timerPlaying.purposePlaying);

    this.statusNotStarted = 1;
    this.statusShowingCards = 2;
    this.statusPlaying = 3;
    this.statusWon = 4;
    this.statusLost = 5;

    this.status = this.statusNotStarted;
    this.gameBoard = $("#gameBoard");

    this.notificationWin = {
        "msg": "You win",
        "class": "success"
    };

    this.notificationLost = {
        "msg": "You lost",
        "class": "danger"
    };

    this.ShowNotification = function (notification) {
        $("#notification-text").attr('class', notification.class).text(notification.msg);
        $("#notification-modal").modal("show");
    };

    this.clickOnCard = function () {
        var self = this;
        $(document).on('click', '.card', function () {
            if (self.status == self.statusPlaying && self.getNotPairedArray().length <= 1) {
                if (self.board.table[$(this).attr('data-row')][$(this).attr('data-col')].status == self.board.table[$(this).attr('data-row')][$(this).attr('data-col')].statusClose) {
                    self.board.table[$(this).attr('data-row')][$(this).attr('data-col')].open();
                    self.check();
                }
            }
        });
    };

    this.getNotPairedArray = function () {
        var temp = [];

        for (var i = 0; i < this.board.widthHeight; i++) {
            for (var j = 0; j < this.board.widthHeight; j++) {
                if (this.board.table[i][j].status == this.board.table[i][j].statusOpen && this.board.table[i][j].isBothOpen == false) {
                    temp.push(this.board.table[i][j]);
                }
            }
        }
        ;

        return temp;
    };

    this.check = function () {

        var temp = this.getNotPairedArray();
        if (temp.length == 2) {
            if (temp[0].value == temp[1].value) {
                temp[0].isBothOpen = true;
                temp[1].isBothOpen = true;

            } else {

                setTimeout(function () {
                    temp[0].close();
                    temp[1].close();

                }, 1000);

            }
        }

        var hasWon = true;
        outer_loop:
            for (var i = 0; i < this.board.widthHeight; i++) {
                for (var j = 0; j < this.board.widthHeight; j++) {
                    if (this.board.table[i][j].isBothOpen == false) {
                        hasWon = false;
                        break outer_loop;
                    }
                }
            }

        if (hasWon) {
            this.status = this.statusWon;
            this.ShowNotification(this.notificationWin);
            clearInterval(this.playInterval);
        }

    };

    this.drawBoard = function () {
        this.gameBoard.html("");
        for (var i = 0; i < this.board.widthHeight; i++) {
            for (var j = 0; j < this.board.widthHeight; j++) {
                this.gameBoard.append("<img class='card' src='images/back.jpg' alt='' data-id='" + this.board.table[i][j].id + "' data-row='" + i + "' data-col='" + j + "'/>");
            }
            this.gameBoard.append('<br>');
        }
    };

    this.init = function () {
        var self = this;
        $('#start-game').hide();
        $('#timer').addClass('vis-hidden');
        self.board.shuffle();
        self.drawBoard();
        self.board.openAll();
        self.status = self.statusShowingCards;
        self.intervalInitial = setInterval(function () {
            self.timerInitial.decreaseTime();
            if (self.timerInitial.time == 0) {
                self.board.closeAll();
                self.status = self.statusPlaying;
                clearInterval(self.intervalInitial);
                self.clickOnCard();
                self.play();
            }
        }, 1000);

    };

    this.play = function () {
        var self = this;
        $('#timer').removeClass('vis-hidden');
        self.playInterval = setInterval(function () {
            $('#timer').text(self.timerPlaying.time);
            self.timerPlaying.decreaseTime();
            if (self.timerPlaying.time == 0) {
                self.status = self.statusLost;
                self.ShowNotification(self.notificationLost);
                clearInterval(self.playInterval);
            }
        }, 1000)
    };

    this.startGame = function () {
        this.listenerStart();
        this.listenerRestart();
    };

    this.listenerStart = function () {
        var self = this;
        $(document).on('click', '#start-game', function (event) {
            event.preventDefault();
            self.init();
            $('#timer').text(self.timerPlaying.time);
        });

    };

    this.listenerRestart = function () {
        var self = this;
        $(document).on('click', '#start-again', function (event) {
            event.preventDefault();
            self.init();
            self.timerInitial.restartTime();
            self.timerPlaying.restartTime();
            $('#timer').text(self.timerPlaying.time);
            $('#notification-modal').modal('hide');

        });

    }

};

$(document).ready(function () {

    var game = new Game();
    game.startGame();

});