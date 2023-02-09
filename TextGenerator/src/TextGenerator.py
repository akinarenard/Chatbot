#!/usr/bin/env -P /usr/bin:/usr/local/bin python3 -B
# coding: utf-8

#
#  TextGenerator.py
#  TextGenerator version 1.0
#  Created by Ingenuity i/o on 2023/02/09
#
# "no description"
#
import ingescape as igs
import sys


class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class TextGenerator(metaclass=Singleton):
    def __init__(self):
        # inputs
        self.JSONI = None

        # outputs
        self._TextO = None

    # outputs
    @property
    def TextO(self):
        return self._TextO

    @TextO.setter
    def TextO(self, value):
        self._TextO = value
        if self._TextO is not None:
            igs.output_set_string("Text", self._TextO)
    @staticmethod
    def set_ValidO():
        igs.output_set_impulsion("Valid")
        print("impulsion sent")

    @staticmethod
    def set_ErrorO():
        igs.output_set_impulsion("Error")



